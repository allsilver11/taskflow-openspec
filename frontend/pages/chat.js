const ChatPage = {
  teamId: null,
  teamName: null,
  lastMsgTime: null,

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <header class="bg-teal-600 text-white px-5 py-3 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <button onclick="navigate('#teams')" class="text-sm opacity-80 hover:opacity-100">← 팀 목록</button>
            <span class="font-bold">${this.teamName}</span>
          </div>
          <span class="text-sm opacity-70">${Auth.getUser()?.email || ''}</span>
        </header>
        <nav class="bg-white border-b flex gap-0 flex-shrink-0">
          <button onclick="navigate('#kanban')" class="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600">칸반</button>
          <button class="px-6 py-2.5 text-sm font-medium border-b-2 border-teal-600 text-teal-600">채팅</button>
        </nav>
        <div id="cp-msgs" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"></div>
        <div class="border-t bg-white p-3 flex gap-2">
          <input id="cp-input" type="text" placeholder="메시지 입력..."
                 class="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                 onkeydown="if(event.key==='Enter') ChatPage._send()">
          <button onclick="ChatPage._send()"
                  class="bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700">전송</button>
        </div>
      </div>`;

    this._load();
    window._pollingInterval = setInterval(() => this._poll(), 5000);
  },

  async _load() {
    try {
      const msgs = await apiFetch(`/teams/${this.teamId}/messages`);
      this._render(msgs, false);
      if (msgs.length) this.lastMsgTime = msgs[msgs.length - 1].created_at;
    } catch (e) { console.error(e.message); }
  },

  async _poll() {
    if (!document.getElementById('cp-msgs')) return;
    try {
      const url = this.lastMsgTime
        ? `/teams/${this.teamId}/messages?since=${encodeURIComponent(this.lastMsgTime)}`
        : `/teams/${this.teamId}/messages`;
      const msgs = await apiFetch(url);
      if (msgs.length) {
        this._render(msgs, true);
        this.lastMsgTime = msgs[msgs.length - 1].created_at;
      }
    } catch (e) { console.error(e.message); }
  },

  _render(msgs, append) {
    const el = document.getElementById('cp-msgs');
    if (!el) return;
    const me = Auth.getUser()?.id;
    const html = msgs.map(m => {
      const mine = m.user_id === me;
      const time = new Date(m.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      return `<div class="flex flex-col ${mine ? 'items-end' : 'items-start'}">
        <span class="text-xs text-gray-400 mb-1">${mine ? '' : m.sender_email + ' · '}${time}</span>
        <span class="px-4 py-2 rounded-2xl text-sm max-w-xs break-words
                     ${mine ? 'bg-teal-500 text-white' : 'bg-white text-gray-800 shadow-sm'}">${m.content}</span>
      </div>`;
    }).join('');
    if (append) el.insertAdjacentHTML('beforeend', html);
    else el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  },

  async _send() {
    const input = document.getElementById('cp-input');
    const content = input.value.trim();
    if (!content) return;
    try {
      await apiFetch(`/teams/${this.teamId}/messages`, {
        method: 'POST', body: JSON.stringify({ content }),
      });
      input.value = '';
      await this._poll();
    } catch (e) { console.error(e.message); }
  },
};
