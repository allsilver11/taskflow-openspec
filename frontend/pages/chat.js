const ChatPage = {
  teamId: null,
  teamName: null,
  lastMsgTime: null,
  _pollDelay: 5000,
  _pollTimer: null,
  _pollFailed: false,

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }
    this._pollDelay = 5000;
    this._pollFailed = false;

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <div id="nb-container"></div>
        <div id="cp-poll-indicator" class="hidden text-xs text-center py-1 bg-yellow-50 text-yellow-700 border-b border-yellow-200"></div>

        <div id="cp-msgs" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"></div>

        <div class="border-t bg-white flex-shrink-0">
          <div class="flex gap-2 p-3">
            <textarea id="cp-input" placeholder="👋 첫 메시지를 입력해보세요…" rows="1"
                   class="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none text-sm"
                   oninput="ChatPage._onInput(this)"
                   onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();ChatPage._send()}"></textarea>
            <button id="cp-send-btn" onclick="ChatPage._send()"
                    class="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 text-sm self-end">전송</button>
          </div>
          <div id="cp-counter-bar" class="hidden px-4 pb-2 text-xs flex justify-between items-center">
            <span id="cp-counter-text"></span>
            <span id="cp-counter-over" class="hidden text-red-500 font-medium"></span>
          </div>
        </div>
      </div>`;

    NavBar.render(document.getElementById('nb-container'), {
      teamName: this.teamName,
      activePage: 'chat',
      onLogout: () => { Auth.logout(); navigate('#login'); },
    });

    // Focus → poll faster
    document.getElementById('cp-input').onfocus = () => { this._pollDelay = 2000; };
    document.getElementById('cp-input').onblur = () => { this._pollDelay = 5000; };

    this.lastMsgTime = null;
    this._load();
    this._schedulePoll();
  },

  _schedulePoll() {
    if (this._pollTimer) clearTimeout(this._pollTimer);
    this._pollTimer = setTimeout(() => this._poll(), this._pollDelay);
    window._pollingInterval = this._pollTimer;
  },

  _setIndicator(ok) {
    const el = document.getElementById('cp-poll-indicator');
    if (!el) return;
    if (ok) {
      el.classList.add('hidden');
    } else {
      el.textContent = '⚠ 연결 끊김 · 재시도 중';
      el.classList.remove('hidden');
    }
  },

  _onInput(el) {
    const len = el.value.length;
    const bar = document.getElementById('cp-counter-bar');
    const text = document.getElementById('cp-counter-text');
    const over = document.getElementById('cp-counter-over');
    const btn = document.getElementById('cp-send-btn');

    if (len < 900) {
      if (bar) bar.classList.add('hidden');
    } else if (len <= 1000) {
      if (bar) { bar.classList.remove('hidden'); bar.className = 'px-4 pb-2 text-xs flex justify-between items-center text-yellow-600'; }
      if (text) text.textContent = `${len} / 1,000`;
      if (over) over.classList.add('hidden');
    } else {
      if (bar) { bar.classList.remove('hidden'); bar.className = 'px-4 pb-2 text-xs flex justify-between items-center text-red-600 bg-red-50'; }
      if (text) text.textContent = `${len} / 1,000`;
      if (over) { over.textContent = `${len - 1000}자 초과  전송(불가)`; over.classList.remove('hidden'); }
    }
    if (btn) btn.disabled = len > 1000;
  },

  async _load() {
    try {
      const msgs = await apiFetch(`/teams/${this.teamId}/messages`);
      this._renderMsgs(msgs, false);
      if (msgs.length) this.lastMsgTime = msgs[msgs.length - 1].created_at;
      this._setIndicator(true);
      this._pollFailed = false;
      this._pollDelay = 5000;
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
        this._renderMsgs(msgs, true);
        this.lastMsgTime = msgs[msgs.length - 1].created_at;
      }
      this._setIndicator(true);
      this._pollFailed = false;
      this._pollDelay = document.getElementById('cp-input') === document.activeElement ? 2000 : 5000;
    } catch (e) {
      if (e.status === 401) return;
      this._pollFailed = true;
      this._setIndicator(false);
      this._pollDelay = Math.min(this._pollDelay * 2, 60000);
    }
    this._schedulePoll();
  },

  _renderMsgs(msgs, append) {
    const el = document.getElementById('cp-msgs');
    if (!el) return;

    if (!append && msgs.length === 0) {
      el.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center py-16">
          <div class="text-5xl mb-4">💬</div>
          <p class="text-gray-500 font-medium mb-1">아직 대화가 없습니다</p>
          <p class="text-gray-400 text-sm">첫 메시지를 보내 팀원과 대화를 시작하세요</p>
        </div>`;
      const input = document.getElementById('cp-input');
      if (input) input.placeholder = '👋 첫 메시지를 입력해보세요…';
      return;
    }

    if (!append && msgs.length > 0) {
      const input = document.getElementById('cp-input');
      if (input) input.placeholder = '메시지 입력 (1000자 이내)…';
    }

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
                            class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition-opacity mb-1">🗑</button>` : ''}
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
