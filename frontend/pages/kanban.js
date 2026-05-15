const KanbanPage = {
  teamId: null,
  teamName: null,
  tasks: [],
  filter: 'all',

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <!-- Header -->
        <header class="bg-teal-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <button onclick="navigate('#teams')" class="text-sm opacity-80 hover:opacity-100 hidden md:inline">← 팀 목록</button>
            <button id="kb-hamburger" class="md:hidden p-1">☰</button>
            <span class="font-bold truncate max-w-32 md:max-w-none">${this.teamName}</span>
          </div>
          <nav class="hidden md:flex items-center gap-1">
            <button onclick="navigate('#kanban')" class="px-3 py-1 rounded bg-teal-500 text-white text-sm font-medium">칸반</button>
            <button onclick="navigate('#chat')" class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">채팅</button>
            <span class="text-teal-200 text-sm ml-2 mr-1">${Auth.getUser()?.email || ''}</span>
            <button id="kb-logout" class="text-sm text-teal-200 hover:text-white">로그아웃</button>
          </nav>
        </header>

        <!-- Mobile menu -->
        <div id="kb-mobile-menu" class="hidden md:hidden fixed inset-0 z-30 bg-black/50" onclick="this.classList.add('hidden')">
          <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6 space-y-4" onclick="event.stopPropagation()">
            <div class="font-semibold text-gray-700">${Auth.getUser()?.email || ''}</div>
            <div class="text-xs text-gray-400">${this.teamName}</div>
            <hr>
            <button onclick="navigate('#kanban'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-teal-600 font-medium">📋 칸반</button>
            <button onclick="navigate('#chat'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">💬 채팅</button>
            <button onclick="navigate('#teams'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">👥 팀 목록</button>
            <hr>
            <button id="kb-logout-mobile" class="flex items-center gap-2 w-full py-2 text-red-500">🚪 로그아웃</button>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="bg-white border-b px-4 py-2 flex items-center gap-2 flex-shrink-0 overflow-x-auto">
          <span class="text-xs text-gray-500 flex-shrink-0">필터:</span>
          ${[['all','전체'],['me','@me'],['unassigned','미할당']].map(([v,l]) =>
            `<button onclick="KanbanPage._setFilter('${v}')" id="filter-${v}"
                     class="px-3 py-1 rounded-full text-xs flex-shrink-0 ${this.filter===v ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">${l}</button>`
          ).join('')}
        </div>

        <!-- Kanban columns (desktop: 3col, mobile: swipe 1col) -->
        <div class="flex-1 overflow-hidden">
          <!-- Desktop -->
          <div class="hidden md:flex gap-4 h-full p-4 overflow-auto">
            ${['TODO','DOING','DONE'].map(col => `
              <div class="flex-1 flex flex-col min-w-0">
                <div class="flex justify-between items-center mb-2 px-1">
                  <h2 class="font-bold text-gray-600 text-sm tracking-wide">${col}</h2>
                  ${col==='TODO' ? `<button onclick="KanbanPage._showAdd()" class="text-teal-600 text-xl font-light leading-none hover:text-teal-800">+</button>` : ''}
                </div>
                <div id="col-${col}" class="flex-1 bg-gray-100 rounded-xl p-2 space-y-2 min-h-24"
                     ondragover="event.preventDefault()"
                     ondrop="KanbanPage._drop(event,'${col}')"></div>
              </div>`).join('')}
          </div>

          <!-- Mobile: swipe columns -->
          <div class="md:hidden flex flex-col h-full">
            <div class="flex border-b bg-white flex-shrink-0">
              ${['TODO','DOING','DONE'].map((col,i) =>
                `<button onclick="KanbanPage._showMobileCol(${i})" id="mob-tab-${i}"
                         class="flex-1 py-2 text-xs font-medium ${i===0?'border-b-2 border-teal-600 text-teal-600':'text-gray-400'}">${col}</button>`
              ).join('')}
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-2" id="mob-col-content"></div>
            <!-- FAB -->
            <button onclick="KanbanPage._showAdd()"
                    class="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-teal-700 z-10">+</button>
          </div>
        </div>
      </div>

      <!-- Add Task Modal -->
      <div id="kb-add-modal" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
          <h3 class="font-semibold mb-3">태스크 추가</h3>
          <input id="kb-new-title" type="text" placeholder="태스크 이름"
                 class="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                 onkeydown="if(event.key==='Enter') KanbanPage._addTask()">
          <div class="flex gap-2">
            <button onclick="KanbanPage._addTask()" class="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">추가</button>
            <button onclick="KanbanPage._hideAdd()" class="flex-1 border py-2 rounded-lg hover:bg-gray-50">취소</button>
          </div>
        </div>
      </div>`;

    document.getElementById('kb-logout').onclick = () => { Auth.logout(); navigate('#login'); };
    document.getElementById('kb-logout-mobile').onclick = () => { Auth.logout(); navigate('#login'); };
    document.getElementById('kb-hamburger').onclick = () => {
      document.getElementById('kb-mobile-menu').classList.remove('hidden');
    };

    this._mobileColIndex = 0;
    this._loadTasks();
  },

  _setFilter(f) {
    this.filter = f;
    ['all','me','unassigned'].forEach(v => {
      const btn = document.getElementById(`filter-${v}`);
      if (!btn) return;
      btn.className = `px-3 py-1 rounded-full text-xs flex-shrink-0 ${v===f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
    });
    this._loadTasks();
  },

  async _loadTasks() {
    try {
      const url = this.filter === 'all'
        ? `/teams/${this.teamId}/tasks`
        : `/teams/${this.teamId}/tasks?filter=${this.filter}`;
      this.tasks = await apiFetch(url);
      this._renderTasks();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  _renderTasks() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this._renderMobileCol(this._mobileColIndex ?? 0);
    } else {
      ['TODO','DOING','DONE'].forEach(col => {
        const el = document.getElementById(`col-${col}`);
        if (!el) return;
        el.innerHTML = this._colHTML(col);
      });
    }
  },

  _colHTML(col) {
    const items = this.tasks.filter(t => t.status === col);
    if (!items.length) return `<p class="text-xs text-gray-300 text-center pt-6">없음</p>`;
    return items.map(t => `
      <div draggable="true" ondragstart="KanbanPage._dragStart(event,${t.id})"
           class="bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing text-sm">
        <div class="flex justify-between items-start gap-1">
          <span class="break-words">${t.title}</span>
          <button onclick="KanbanPage._delete(${t.id})" class="text-gray-300 hover:text-red-400 flex-shrink-0 ml-1 text-xs">✕</button>
        </div>
        ${t.assignee_id ? `<div class="text-xs text-teal-500 mt-1">@담당자#${t.assignee_id}</div>` : ''}
      </div>`).join('');
  },

  _showMobileCol(idx) {
    this._mobileColIndex = idx;
    ['TODO','DOING','DONE'].forEach((col, i) => {
      const tab = document.getElementById(`mob-tab-${i}`);
      if (tab) tab.className = `flex-1 py-2 text-xs font-medium ${i===idx ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-400'}`;
    });
    this._renderMobileCol(idx);
  },

  _renderMobileCol(idx) {
    const col = ['TODO','DOING','DONE'][idx];
    const el = document.getElementById('mob-col-content');
    if (!el) return;
    el.innerHTML = this._colHTML(col);
    el.querySelectorAll('[draggable]').forEach(card => {
      card.removeAttribute('draggable');
      card.style.cursor = 'pointer';
      const taskId = parseInt(card.querySelector('button').getAttribute('onclick').match(/\d+/)[0]);
      card.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') return;
        this._showStatusMenu(taskId, col);
      });
    });
  },

  _showStatusMenu(taskId, currentStatus) {
    const options = ['TODO','DOING','DONE'].filter(s => s !== currentStatus);
    const html = `
      <div id="status-menu" class="fixed inset-0 bg-black/40 flex items-end justify-center z-20 md:hidden"
           onclick="document.getElementById('status-menu').remove()">
        <div class="bg-white rounded-t-xl w-full p-4 space-y-2" onclick="event.stopPropagation()">
          <p class="text-sm font-medium text-gray-500 mb-3">상태 변경</p>
          ${options.map(s => `
            <button onclick="KanbanPage._patchStatus(${taskId},'${s}'); document.getElementById('status-menu').remove()"
                    class="w-full py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-teal-50">→ ${s}</button>`).join('')}
          <button onclick="document.getElementById('status-menu').remove()" class="w-full py-3 text-gray-400 text-sm">취소</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  _dragStart(e, id) { e.dataTransfer.setData('taskId', id); },

  async _drop(e, status) {
    const id = parseInt(e.dataTransfer.getData('taskId'));
    await this._patchStatus(id, status);
  },

  async _patchStatus(id, status) {
    const task = this.tasks.find(t => t.id === id);
    if (!task || task.status === status) return;
    try {
      const updated = await apiFetch(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      task.status = updated.status;
      this._renderTasks();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
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
      const task = await apiFetch(`/teams/${this.teamId}/tasks`, { method: 'POST', body: JSON.stringify({ title }) });
      this.tasks.unshift(task);
      this._renderTasks();
      this._hideAdd();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  async _delete(id) {
    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      this.tasks = this.tasks.filter(t => t.id !== id);
      this._renderTasks();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },
};
