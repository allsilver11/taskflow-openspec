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
        <header class="bg-teal-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <button onclick="navigate('#teams')" class="text-sm opacity-80 hover:opacity-100 hidden md:inline">← 팀 목록</button>
            <button id="cp-hamburger" class="md:hidden p-1">☰</button>
            <span class="font-bold truncate max-w-32 md:max-w-none">${this.teamName}</span>
          </div>
          <nav class="hidden md:flex items-center gap-1">
            <button onclick="navigate('#kanban')" class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">칸반</button>
            <button onclick="navigate('#chat')" class="px-3 py-1 rounded bg-teal-500 text-white text-sm font-medium">채팅</button>
            <span class="text-teal-200 text-sm ml-2">${Auth.getUser()?.email || ''}</span>
          </nav>
        </header>

        <!-- Mobile menu -->
        <div id="cp-mobile-menu" class="hidden md:hidden fixed inset-0 z-30 bg-black/50" onclick="this.classList.add('hidden')">
          <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6 space-y-4" onclick="event.stopPropagation()">
            <div class="font-semibold text-gray-700">${Auth.getUser()?.email || ''}</div>
            <div class="text-xs text-gray-400">${this.teamName}</div>
            <hr>
            <button onclick="navigate('#kanban'); document.getElementById('cp-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">📋 칸반</button>
            <button onclick="navigate('#chat'); document.getElementById('cp-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-teal-600 font-medium">💬 채팅</button>
            <button onclick="navigate('#teams'); document.getElementById('cp-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">👥 팀 목록</button>
            <hr>
            <button onclick="Auth.logout(); navigate('#login')" class="flex items-center gap-2 w-full py-2 text-red-500">🚪 로그아웃</button>
          </div>
        </div>

        <div id="cp-msgs" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"></div>

        <div class="border-t bg-white p-3 flex-shrink-0">
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <textarea id="cp-input" placeholder="메시지 입력 (1000자 이내)..." rows="1"
                     class="w-full border rounded-xl px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none text-sm"
                     oninput="ChatPage._onInput(this)"
                     onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();ChatPage._send()}"></textarea>
              <span id="cp-counter" class="absolute bottom-2 right-3 text-xs text-gray-300">0/1000</span>
            </div>
            <button onclick="ChatPage._send()"
                    class="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 text-sm self-end">전송</button>
          </div>
        </div>
      </div>`;

    document.getElementById('cp-hamburger').onclick = () => {
      document.getElementById('cp-mobile-menu').classList.remove('hidden');
    };

    this.lastMsgTime = null;
    this._load();
    window._pollingInterval = setInterval(() => this._poll(), 5000);
  },

  _onInput(el) {
    const len = el.value.length;
    const counter = document.getElementById('cp-counter');
    if (!counter) return;
    counter.textContent = `${len}/1000`;
    counter.className = `absolute bottom-2 right-3 text-xs ${len > 1000 ? 'text-red-500 font-medium' : 'text-gray-300'}`;
    const btn = el.closest('div').nextElementSibling;
    if (btn) btn.disabled = len > 1000;
  },

  async _load() {
    try {
      const msgs = await apiFetch(`/teams/${this.teamId}/messages`);
      this._render(msgs, false);
      if (msgs.length) this.lastMsgTime = msgs[msgs.length - 1].created_at;
    } catch (e) { if (e.status !== 401) console.error(e.message); }
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
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  _render(msgs, append) {
    const el = document.getElementById('cp-msgs');
    if (!el) return;
    const me = Auth.getUser()?.id;
    const html = msgs.map(m => {
      const mine = m.user_id === me;
      const time = new Date(m.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      return `<div class="flex flex-col ${mine ? 'items-end' : 'items-start'} group">
        <span class="text-xs text-gray-400 mb-1">${mine ? '' : m.sender_email + ' · '}${time}</span>
        <div class="flex items-end gap-1 ${mine ? 'flex-row-reverse' : ''}">
          <span class="px-4 py-2 rounded-2xl text-sm max-w-xs break-words
                       ${mine ? 'bg-teal-500 text-white' : 'bg-white text-gray-800 shadow-sm'}">${m.content}</span>
          ${mine ? `<button onclick="ChatPage._deleteMsg(${m.id})"
                            class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition-opacity">🗑</button>` : ''}
        </div>
      </div>`;
    }).join('');
    if (append) el.insertAdjacentHTML('beforeend', html);
    else el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  },

  async _send() {
    const input = document.getElementById('cp-input');
    const content = input.value.trim();
    if (!content || content.length > 1000) return;
    try {
      await apiFetch(`/teams/${this.teamId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
      input.value = '';
      this._onInput(input);
      await this._load();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  async _deleteMsg(id) {
    try {
      await apiFetch(`/messages/${id}`, { method: 'DELETE' });
      await this._load();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },
};
