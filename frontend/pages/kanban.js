const COL_STYLE = {
  TODO:  { header: 'bg-yellow-100 text-yellow-800', body: 'bg-yellow-50',  drag: 'ring-yellow-400' },
  DOING: { header: 'bg-blue-100 text-blue-800',    body: 'bg-blue-50',    drag: 'ring-blue-400'   },
  DONE:  { header: 'bg-green-100 text-green-800',  body: 'bg-green-50',   drag: 'ring-green-400'  },
};

const KanbanPage = {
  teamId: null,
  teamName: null,
  tasks: [],
  members: [],
  filter: 'all',
  isOwner: false,
  _dragging: false,
  _showMemberPanel: false,
  _mobileColIndex: 0,

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <!-- Header -->
        <header class="bg-teal-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <span class="font-bold text-white hidden md:inline">TaskFlow</span>
            <button id="kb-hamburger" class="md:hidden p-1">☰</button>
            <span class="text-teal-200 text-sm hidden md:inline">|</span>
            <span class="font-medium truncate max-w-32 md:max-w-none">${this.teamName}</span>
          </div>
          <nav class="hidden md:flex items-center gap-1">
            <button onclick="navigate('#kanban')" class="px-3 py-1 rounded bg-teal-500 text-white text-sm font-medium">칸반</button>
            <button onclick="navigate('#chat')" class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">채팅</button>
            <button onclick="KanbanPage._toggleMemberPanel()" id="kb-members-btn"
                    class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">멤버</button>
            <span class="text-teal-200 text-sm ml-2 mr-1">${Auth.getUser()?.email || ''}</span>
            <button id="kb-logout" class="text-sm text-teal-200 hover:text-white">로그아웃</button>
          </nav>
        </header>

        <!-- Mobile menu -->
        <div id="kb-mobile-menu" class="hidden md:hidden fixed inset-0 z-30 bg-black/50" onclick="this.classList.add('hidden')">
          <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6 space-y-4" onclick="event.stopPropagation()">
            <div class="font-bold text-teal-600">TaskFlow</div>
            <div class="text-sm font-semibold text-gray-700">${this.teamName}</div>
            <div class="text-xs text-gray-400">${Auth.getUser()?.email || ''}</div>
            <hr>
            <button onclick="navigate('#kanban'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-teal-600 font-medium">📋 칸반</button>
            <button onclick="navigate('#chat'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">💬 채팅</button>
            <button onclick="navigate('#members'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">👥 팀 멤버</button>
            <button onclick="navigate('#teams'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">← 팀 목록</button>
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

        <!-- Main area: kanban + optional member panel -->
        <div class="flex flex-1 overflow-hidden">

          <!-- Kanban columns -->
          <div class="flex-1 overflow-hidden">
            <!-- Desktop -->
            <div class="hidden md:flex gap-4 h-full p-4 overflow-auto">
              ${['TODO','DOING','DONE'].map(col => `
                <div class="flex-1 flex flex-col min-w-0">
                  <div class="flex justify-between items-center mb-2 px-3 py-2 rounded-t-xl ${COL_STYLE[col].header}">
                    <h2 id="col-title-${col}" class="font-bold text-sm tracking-wide">${col} · 0</h2>
                    ${col==='TODO' ? `<button onclick="KanbanPage._showInlineAdd()" class="text-xl font-light leading-none hover:opacity-70">+</button>` : ''}
                  </div>
                  <div id="col-${col}" class="flex-1 ${COL_STYLE[col].body} rounded-b-xl p-2 space-y-2 min-h-24 transition-colors"
                       ondragover="KanbanPage._onDragOver(event,'${col}')"
                       ondragleave="KanbanPage._onDragLeave(event,'${col}')"
                       ondrop="KanbanPage._drop(event,'${col}')"></div>
                </div>`).join('')}
            </div>

            <!-- Mobile -->
            <div class="md:hidden flex flex-col h-full">
              <div class="flex border-b bg-white flex-shrink-0">
                ${['TODO','DOING','DONE'].map((col,i) =>
                  `<button onclick="KanbanPage._showMobileCol(${i})" id="mob-tab-${i}"
                           class="flex-1 py-2 text-xs font-medium ${i===0?'border-b-2 border-teal-600 text-teal-600':'text-gray-400'}">${col}</button>`
                ).join('')}
              </div>
              <div class="flex-1 overflow-y-auto p-3 space-y-2" id="mob-col-content"></div>
              <button onclick="KanbanPage._showInlineAdd()"
                      class="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-teal-700 z-10">+</button>
            </div>
          </div>

          <!-- Member side panel (desktop, toggled) -->
          <div id="kb-member-panel" class="hidden xl:hidden w-64 border-l bg-white flex-shrink-0 flex flex-col">
            <div class="px-4 py-3 border-b flex justify-between items-center">
              <span class="font-semibold text-gray-700 text-sm">팀 멤버</span>
              <button onclick="KanbanPage._toggleMemberPanel()" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div id="kb-member-list" class="flex-1 overflow-y-auto p-3 space-y-2"></div>
          </div>
        </div>
      </div>

      <!-- Card detail modal -->
      <div id="kb-detail-modal" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg" id="kb-detail-content"></div>
      </div>

      <!-- Delete confirm dialog -->
      <div id="kb-delete-confirm" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-30 px-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-xs shadow-xl text-center">
          <div class="text-4xl mb-3">⚠️</div>
          <p class="font-semibold mb-1 text-gray-800" id="kb-delete-title">이 카드를 삭제하시겠습니까?</p>
          <p class="text-xs text-gray-400 mb-5">되돌릴 수 없습니다</p>
          <div class="flex gap-2">
            <button onclick="document.getElementById('kb-delete-confirm').classList.add('hidden')"
                    class="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-sm">취소</button>
            <button id="kb-delete-ok" class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm">삭제</button>
          </div>
        </div>
      </div>`;

    document.getElementById('kb-logout').onclick = () => { Auth.logout(); navigate('#login'); };
    document.getElementById('kb-logout-mobile').onclick = () => { Auth.logout(); navigate('#login'); };
    document.getElementById('kb-hamburger').onclick = () => document.getElementById('kb-mobile-menu').classList.remove('hidden');

    this._mobileColIndex = 0;
    this._showMemberPanel = false;
    this._loadMembers();
    this._loadTasks();
  },

  async _loadMembers() {
    try {
      this.members = await apiFetch(`/teams/${this.teamId}/members`);
      const me = Auth.getUser()?.id;
      this.isOwner = this.members.some(m => m.id === me && m.is_owner);
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  _toggleMemberPanel() {
    this._showMemberPanel = !this._showMemberPanel;
    const panel = document.getElementById('kb-member-panel');
    const btn = document.getElementById('kb-members-btn');
    if (!panel) return;
    if (this._showMemberPanel) {
      panel.classList.remove('hidden');
      panel.classList.add('xl:flex', 'flex');
      if (btn) btn.classList.add('bg-teal-500');
      this._renderMemberPanel();
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('xl:flex', 'flex');
      if (btn) btn.classList.remove('bg-teal-500');
    }
  },

  _renderMemberPanel() {
    const el = document.getElementById('kb-member-list');
    if (!el || !this.members.length) return;
    const sorted = [...this.members].sort((a, b) => (b.is_owner ? 1 : 0) - (a.is_owner ? 1 : 0));
    const me = Auth.getUser()?.id;
    el.innerHTML = sorted.map(m => `
      <div class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
        <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
          ${m.email[0].toUpperCase()}
        </div>
        <div class="min-w-0">
          <div class="text-xs font-medium text-gray-800 truncate">${m.email}${m.id === me ? ' (나)' : ''}</div>
          <div class="text-xs ${m.is_owner ? 'text-amber-500' : 'text-gray-400'}">${m.is_owner ? '★ owner' : 'member'}</div>
        </div>
      </div>`).join('');
  },

  _setFilter(f) {
    this.filter = f;
    ['all','me','unassigned'].forEach(v => {
      const btn = document.getElementById(`filter-${v}`);
      if (btn) btn.className = `px-3 py-1 rounded-full text-xs flex-shrink-0 ${v===f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
    });
    this._loadTasks();
  },

  async _loadTasks() {
    try {
      const url = this.filter === 'all' ? `/teams/${this.teamId}/tasks` : `/teams/${this.teamId}/tasks?filter=${this.filter}`;
      this.tasks = await apiFetch(url);
      this._renderTasks();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  _getAssigneeEmail(assignee_id) {
    if (!assignee_id) return null;
    const m = this.members.find(m => m.id === assignee_id);
    return m ? m.email.split('@')[0] : `#${assignee_id}`;
  },

  _renderTasks() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this._renderMobileCol(this._mobileColIndex ?? 0);
    } else {
      ['TODO','DOING','DONE'].forEach(col => {
        const colEl = document.getElementById(`col-${col}`);
        const titleEl = document.getElementById(`col-title-${col}`);
        if (!colEl) return;
        const items = this.tasks.filter(t => t.status === col);
        if (titleEl) titleEl.textContent = `${col} · ${items.length}`;
        // preserve inline form if present
        const inlineForm = colEl.querySelector('#kb-inline-add-form');
        colEl.innerHTML = '';
        if (inlineForm) colEl.appendChild(inlineForm);
        colEl.insertAdjacentHTML('beforeend', this._cardsHTML(col, items));
      });
    }
  },

  _cardsHTML(col, items) {
    if (!items.length) {
      return col === 'TODO'
        ? `<div class="text-center py-6">
            <div class="text-3xl mb-2">📋</div>
            <p class="text-xs text-gray-400 mb-3">카드 없음</p>
            <button onclick="KanbanPage._showInlineAdd()" class="text-xs text-teal-600 border border-teal-300 rounded-full px-3 py-1 hover:bg-teal-50">+ 첫 태스크 만들기</button>
          </div>`
        : `<div class="text-center py-6"><div class="text-3xl mb-2">📋</div><p class="text-xs text-gray-400">카드 없음<br><span class="text-gray-300">드래그로 이동</span></p></div>`;
    }
    return items.map(t => {
      const assigneeLabel = t.assignee_id ? `@${this._getAssigneeEmail(t.assignee_id)}` : null;
      const canDel = this.isOwner || t.creator_id === Auth.getUser()?.id;
      return `
        <div draggable="true"
             ondragstart="KanbanPage._dragStart(event,${t.id})"
             onclick="KanbanPage._openDetail(${t.id})"
             class="bg-white rounded-lg p-3 shadow-sm cursor-pointer text-sm select-none border border-transparent hover:border-gray-200">
          <div class="flex justify-between items-start gap-1">
            <span class="break-words">${t.title}</span>
            ${canDel ? `<button onclick="event.stopPropagation(); KanbanPage._confirmDelete(${t.id}, '${t.title.replace(/'/g,"\\'")}' )"
                               class="text-gray-300 hover:text-red-400 flex-shrink-0 ml-1 text-xs">✕</button>` : ''}
          </div>
          <div class="flex items-center gap-2 mt-1.5">
            <span class="text-xs text-gray-400">#${t.id}</span>
            ${assigneeLabel ? `<span class="text-xs text-teal-500">${assigneeLabel}</span>` : `<span class="text-xs text-amber-400">⚠미할당</span>`}
          </div>
        </div>`;
    }).join('');
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
    const items = this.tasks.filter(t => t.status === col);
    el.innerHTML = this._cardsHTML(col, items);
  },

  _dragStart(e, id) {
    this._dragging = true;
    e.dataTransfer.setData('taskId', id);
  },

  _onDragOver(e, col) {
    e.preventDefault();
    const el = document.getElementById(`col-${col}`);
    if (el) el.classList.add('ring-2', COL_STYLE[col].drag);
  },

  _onDragLeave(e, col) {
    const el = document.getElementById(`col-${col}`);
    if (el) el.classList.remove('ring-2', COL_STYLE[col].drag);
  },

  async _drop(e, status) {
    this._dragging = false;
    const el = document.getElementById(`col-${status}`);
    if (el) el.classList.remove('ring-2', COL_STYLE[status].drag);
    const id = parseInt(e.dataTransfer.getData('taskId'));
    await this._patchStatus(id, status);
    setTimeout(() => { this._dragging = false; }, 100);
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

  _showInlineAdd() {
    const col = document.getElementById('col-TODO');
    if (!col || col.querySelector('#kb-inline-add-form')) return;
    const memberOpts = '<option value="">담당자 없음</option>' +
      this.members.map(m => `<option value="${m.id}">${m.email}</option>`).join('');
    const form = document.createElement('div');
    form.id = 'kb-inline-add-form';
    form.className = 'bg-white border-2 border-teal-400 rounded-lg p-3 mb-2 text-sm';
    form.innerHTML = `
      <input id="kb-inline-title" type="text" placeholder="태스크 이름"
             class="w-full border-b pb-1 mb-2 focus:outline-none text-sm"
             onkeydown="if(event.key==='Enter'){event.preventDefault();KanbanPage._addTask();}if(event.key==='Escape')KanbanPage._hideInlineAdd();">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs text-gray-500">담당자:</span>
        <select id="kb-inline-assignee" class="flex-1 text-xs border-b focus:outline-none bg-transparent">${memberOpts}</select>
      </div>
      <p class="text-xs text-gray-400">Enter: 저장 · Esc: 취소</p>`;
    col.insertBefore(form, col.firstChild);
    document.getElementById('kb-inline-title').focus();
  },

  _hideInlineAdd() {
    const form = document.getElementById('kb-inline-add-form');
    if (form) form.remove();
  },

  async _addTask() {
    const titleEl = document.getElementById('kb-inline-title');
    const title = titleEl?.value.trim();
    if (!title) return;
    const assigneeEl = document.getElementById('kb-inline-assignee');
    const assignee_id = assigneeEl?.value || null;
    try {
      const task = await apiFetch(`/teams/${this.teamId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, assignee_id: assignee_id ? parseInt(assignee_id) : null }),
      });
      this.tasks.unshift(task);
      this._hideInlineAdd();
      this._renderTasks();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  _openDetail(id) {
    if (this._dragging) return;
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    const creatorEmail = this.members.find(m => m.id === task.creator_id)?.email || `#${task.creator_id}`;
    const createdAt = task.created_at ? new Date(task.created_at).toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
    const memberOpts = '<option value="">담당자 없음</option>' +
      this.members.map(m => `<option value="${m.id}" ${m.id === task.assignee_id ? 'selected' : ''}>${m.email}</option>`).join('');
    const canDel = this.isOwner || task.creator_id === Auth.getUser()?.id;

    document.getElementById('kb-detail-content').innerHTML = `
      <div class="p-5 border-b flex items-center gap-3">
        <span class="text-xs text-gray-400 font-mono">#${task.id}</span>
        <input id="detail-title" type="text" value="${task.title.replace(/"/g,'&quot;')}"
               class="flex-1 font-semibold text-gray-800 focus:outline-none border-b border-transparent focus:border-teal-400 py-0.5">
        <button onclick="document.getElementById('kb-detail-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-0">
        <!-- Left: info -->
        <div class="p-5 border-r space-y-4">
          <div>
            <p class="text-xs text-gray-500 mb-2">상태</p>
            <div class="flex gap-1.5">
              ${['TODO','DOING','DONE'].map(s => `
                <button onclick="KanbanPage._detailPatchStatus(${id},'${s}')"
                        class="flex-1 py-1 rounded text-xs font-medium border transition-colors ${task.status===s ? 'bg-teal-600 text-white border-teal-600' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}">${s}</button>`).join('')}
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">담당자</p>
            <select id="detail-assignee" class="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400">
              ${memberOpts}
            </select>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">생성자</p>
            <p class="text-sm text-gray-700">${creatorEmail}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">생성 시각</p>
            <p class="text-sm text-gray-700">${createdAt}</p>
          </div>
        </div>
        <!-- Right: actions -->
        <div class="p-5 flex flex-col gap-3">
          <button onclick="KanbanPage._saveDetail(${id})"
                  class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 text-sm font-medium">저장</button>
          <button onclick="KanbanPage._changeAssigneeToMe(${id})"
                  class="w-full border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 text-sm">다른 담당자 지정</button>
          ${canDel ? `<button onclick="KanbanPage._confirmDelete(${id},'${task.title.replace(/'/g,"\\'")}'); document.getElementById('kb-detail-modal').classList.add('hidden')"
                              class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm flex items-center justify-center gap-1">🗑 삭제</button>` : ''}
        </div>
      </div>`;
    document.getElementById('kb-detail-modal').classList.remove('hidden');
  },

  _changeAssigneeToMe(id) {
    const sel = document.getElementById('detail-assignee');
    if (!sel) return;
    const me = Auth.getUser()?.id;
    if (me) sel.value = me;
  },

  async _detailPatchStatus(id, status) {
    await this._patchStatus(id, status);
    this._openDetail(id);
  },

  async _saveDetail(id) {
    const title = document.getElementById('detail-title').value.trim();
    const assignee_id = document.getElementById('detail-assignee').value;
    if (!title) return;
    try {
      const updated = await apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, assignee_id: assignee_id ? parseInt(assignee_id) : null }),
      });
      const task = this.tasks.find(t => t.id === id);
      if (task) { task.title = updated.title; task.assignee_id = updated.assignee_id; }
      this._renderTasks();
      document.getElementById('kb-detail-modal').classList.add('hidden');
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  _confirmDelete(id, titleText) {
    const modal = document.getElementById('kb-delete-confirm');
    const titleEl = document.getElementById('kb-delete-title');
    if (titleEl && titleText) titleEl.textContent = `'#${id} ${titleText}' — 되돌릴 수 없습니다`;
    modal.classList.remove('hidden');
    document.getElementById('kb-delete-ok').onclick = async () => {
      modal.classList.add('hidden');
      try {
        await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
        this.tasks = this.tasks.filter(t => t.id !== id);
        this._renderTasks();
      } catch (e) { if (e.status !== 401) console.error(e.message); }
    };
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
                    class="w-full py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm">→ ${s}</button>`).join('')}
          <button onclick="document.getElementById('status-menu').remove()" class="w-full py-3 text-gray-400 text-sm">취소</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },
};
