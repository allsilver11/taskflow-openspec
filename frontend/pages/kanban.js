const KanbanPage = {
  teamId: null,
  teamName: null,
  tasks: [],
  lastMsgTime: null,

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <!-- Header -->
        <header class="bg-teal-600 text-white px-5 py-3 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <button onclick="navigate('#teams')" class="text-sm opacity-80 hover:opacity-100">← 팀 목록</button>
            <span class="font-bold">${this.teamName}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm opacity-70">${Auth.getUser()?.email || ''}</span>
            <button id="kb-logout" class="text-sm opacity-80 hover:opacity-100">로그아웃</button>
          </div>
        </header>

        <!-- Body: Kanban + Chat -->
        <div class="flex flex-1 overflow-hidden">

          <!-- Kanban -->
          <div class="flex-1 overflow-auto p-4">
            <div class="flex gap-4 h-full min-h-0">
              ${['TODO', 'DOING', 'DONE'].map(col => `
                <div class="flex-1 flex flex-col min-w-0">
                  <div class="flex justify-between items-center mb-2 px-1">
                    <h2 class="font-bold text-gray-600 text-sm tracking-wide">${col}</h2>
                    ${col === 'TODO' ? `<button onclick="KanbanPage._showAdd()" class="text-teal-600 hover:text-teal-800 text-xl font-light leading-none">+</button>` : ''}
                  </div>
                  <div id="col-${col}"
                       class="flex-1 bg-gray-100 rounded-xl p-2 space-y-2 min-h-24"
                       ondragover="event.preventDefault()"
                       ondrop="KanbanPage._drop(event,'${col}')">
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <!-- Chat Panel -->
          <div class="w-72 flex flex-col border-l bg-white flex-shrink-0">
            <div class="px-4 py-3 border-b text-sm font-semibold text-gray-600">채팅</div>
            <div id="kb-msgs" class="flex-1 overflow-y-auto p-3 space-y-2 text-sm"></div>
            <div class="border-t p-2 flex gap-2">
              <input id="kb-chat-input" type="text" placeholder="메시지..."
                     class="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                     onkeydown="if(event.key==='Enter') KanbanPage._sendMsg()">
              <button onclick="KanbanPage._sendMsg()"
                      class="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-teal-700">전송</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Task Modal -->
      <div id="kb-add-modal" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-20">
        <div class="bg-white rounded-xl p-6 w-80 shadow-xl">
          <h3 class="font-semibold mb-3">태스크 추가</h3>
          <input id="kb-new-title" type="text" placeholder="태스크 이름"
                 class="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
                 onkeydown="if(event.key==='Enter') KanbanPage._addTask()">
          <div class="flex gap-2">
            <button onclick="KanbanPage._addTask()" class="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">추가</button>
            <button onclick="KanbanPage._hideAdd()" class="flex-1 border py-2 rounded-lg hover:bg-gray-50">취소</button>
          </div>
        </div>
      </div>`;

    document.getElementById('kb-logout').onclick = () => { Auth.logout(); navigate('#login'); };
    this._loadTasks();
    this._loadMsgs();
    window._pollingInterval = setInterval(() => this._pollMsgs(), 5000);
  },

  async _loadTasks() {
    try {
      this.tasks = await apiFetch(`/teams/${this.teamId}/tasks`);
      this._renderTasks();
    } catch (e) { console.error(e.message); }
  },

  _renderTasks() {
    ['TODO', 'DOING', 'DONE'].forEach(col => {
      const el = document.getElementById(`col-${col}`);
      if (!el) return;
      const items = this.tasks.filter(t => t.status === col);
      el.innerHTML = items.length
        ? items.map(t => `
            <div draggable="true"
                 ondragstart="KanbanPage._dragStart(event,${t.id})"
                 class="bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing text-sm">
              <div class="flex justify-between items-start gap-1">
                <span class="break-words">${t.title}</span>
                <button onclick="KanbanPage._delete(${t.id})"
                        class="text-gray-300 hover:text-red-400 flex-shrink-0 ml-1 text-xs">✕</button>
              </div>
            </div>`).join('')
        : `<p class="text-xs text-gray-300 text-center pt-6">없음</p>`;
    });
  },

  _dragStart(e, id) { e.dataTransfer.setData('taskId', id); },

  async _drop(e, status) {
    const id = parseInt(e.dataTransfer.getData('taskId'));
    const task = this.tasks.find(t => t.id === id);
    if (!task || task.status === status) return;
    try {
      const updated = await apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      task.status = updated.status;
      this._renderTasks();
    } catch (e) { console.error(e.message); }
  },

  _showAdd() {
    document.getElementById('kb-add-modal').classList.remove('hidden');
    document.getElementById('kb-new-title').focus();
  },
  _hideAdd() {
    document.getElementById('kb-add-modal').classList.add('hidden');
    document.getElementById('kb-new-title').value = '';
  },

  async _addTask() {
    const title = document.getElementById('kb-new-title').value.trim();
    if (!title) return;
    try {
      const task = await apiFetch(`/teams/${this.teamId}/tasks`, {
        method: 'POST', body: JSON.stringify({ title }),
      });
      this.tasks.push(task);
      this._renderTasks();
      this._hideAdd();
    } catch (e) { console.error(e.message); }
  },

  async _delete(id) {
    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      this.tasks = this.tasks.filter(t => t.id !== id);
      this._renderTasks();
    } catch (e) { console.error(e.message); }
  },

  async _loadMsgs() {
    try {
      const msgs = await apiFetch(`/teams/${this.teamId}/messages`);
      this._renderMsgs(msgs, false);
      if (msgs.length) this.lastMsgTime = msgs[msgs.length - 1].created_at;
    } catch (e) { console.error(e.message); }
  },

  async _pollMsgs() {
    if (!document.getElementById('kb-msgs')) return;
    try {
      const url = this.lastMsgTime
        ? `/teams/${this.teamId}/messages?since=${encodeURIComponent(this.lastMsgTime)}`
        : `/teams/${this.teamId}/messages`;
      const msgs = await apiFetch(url);
      if (msgs.length) {
        this._renderMsgs(msgs, true);
        this.lastMsgTime = msgs[msgs.length - 1].created_at;
      }
    } catch (e) { console.error(e.message); }
  },

  _renderMsgs(msgs, append) {
    const el = document.getElementById('kb-msgs');
    if (!el) return;
    const me = Auth.getUser()?.id;
    const html = msgs.map(m => {
      const mine = m.user_id === me;
      const time = new Date(m.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      return `<div class="${mine ? 'text-right' : ''}">
        <div class="text-xs text-gray-400 mb-0.5">${mine ? '' : m.sender_email + ' · '}${time}</div>
        <span class="inline-block rounded-xl px-3 py-1.5 text-sm max-w-[85%] break-words
                     ${mine ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-800'}">${m.content}</span>
      </div>`;
    }).join('');
    if (append) el.insertAdjacentHTML('beforeend', html);
    else el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  },

  async _sendMsg() {
    const input = document.getElementById('kb-chat-input');
    const content = input.value.trim();
    if (!content) return;
    try {
      await apiFetch(`/teams/${this.teamId}/messages`, {
        method: 'POST', body: JSON.stringify({ content }),
      });
      input.value = '';
      await this._pollMsgs();
    } catch (e) { console.error(e.message); }
  },
};
