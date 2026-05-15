const KanbanPage = {
  teamId: null,
  teamName: null,
  tasks: [],

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

        <!-- Tab Nav -->
        <nav class="bg-white border-b flex gap-0 flex-shrink-0">
          <button class="px-6 py-2.5 text-sm font-medium border-b-2 border-teal-600 text-teal-600">칸반</button>
          <button onclick="navigate('#chat')" class="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600">채팅</button>
        </nav>

        <!-- Kanban Board -->
        <div class="flex-1 overflow-auto p-4">
          <div class="flex gap-4 h-full">
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
};
