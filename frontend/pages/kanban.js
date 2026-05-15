const KanbanPage = {
  teamId: null,
  teamName: null,
  tasks: [],
  members: [],
  filter: 'all',
  _dragging: false,
  _dragTimer: null,

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <header class="bg-teal-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <button onclick="navigate('#teams')" class="text-sm opacity-80 hover:opacity-100 hidden md:inline">← 팀 목록</button>
            <button id="kb-hamburger" class="md:hidden p-1">☰</button>
            <span class="font-bold truncate max-w-32 md:max-w-none">${this.teamName}</span>
          </div>
          <nav class="hidden md:flex items-center gap-1">
            <button onclick="navigate('#kanban')" class="px-3 py-1 rounded bg-teal-500 text-white text-sm font-medium">칸반</button>
            <button onclick="navigate('#chat')" class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">채팅</button>
            <button onclick="navigate('#members')" class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">멤버</button>
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
            <button onclick="navigate('#members'); document.getElementById('kb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">👥 멤버</button>
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

        <!-- Kanban columns -->
        <div class="flex-1 overflow-hidden">
          <!-- Desktop -->
          <div class="hidden md:flex gap-4 h-full p-4 overflow-auto">
            ${['TODO','DOING','DONE'].map(col => `
              <div class="flex-1 flex flex-col min-w-0">
                <div class="flex justify-between items-center mb-2 px-1">
                  <h2 id="col-title-${col}" class="font-bold text-gray-600 text-sm tracking-wide">${col} · 0</h2>
                  ${col==='TODO' ? `<button onclick="KanbanPage._showInlineAdd()" class="text-teal-600 text-xl font-light leading-none hover:text-teal-800">+</button>` : ''}
                </div>
                <div id="col-${col}" class="flex-1 bg-gray-100 rounded-xl p-2 space-y-2 min-h-24 transition-colors"
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
      </div>

      <!-- Inline add form (hidden initially) -->
      <div id="kb-inline-form" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
        <div class="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl">
          <h3 class="font-semibold mb-3 text-gray-700">태스크 추가</h3>
          <input id="kb-new-title" type="text" placeholder="태스크 이름"
                 class="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                 onkeydown="if(event.key==='Enter') KanbanPage._addTask(); if(event.key==='Escape') KanbanPage._hideInlineAdd()">
          <select id="kb-new-assignee" class="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
            <option value="">담당자 없음</option>
          </select>
          <div class="flex gap-2">
            <button onclick="KanbanPage._addTask()" class="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">추가</button>
            <button onclick="KanbanPage._hideInlineAdd()" class="flex-1 border py-2 rounded-lg hover:bg-gray-50">취소</button>
          </div>
        </div>
      </div>

      <!-- Card detail modal -->
      <div id="kb-detail-modal" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" id="kb-detail-content"></div>
      </div>

      <!-- Delete confirm dialog -->
      <div id="kb-delete-confirm" class="hidden fixed inset-0 bg-black/40 flex items-center justify-center z-30 px-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-xs shadow-xl text-center">
          <p class="font-semibold mb-1 text-gray-800">이 카드를 삭제하시겠습니까?</p>
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
    this._loadMembers();
    this._loadTasks();
  },

  async _loadMembers() {
    try {
      this.members = await apiFetch(`/teams/${this.teamId}/members`);
      const me = Auth.getUser()?.id;
      this.isOwner = this.members.some(m => m.id === me && m.is_owner);
      const sel = document.getElementById('kb-new-assignee');
      if (sel) {
        sel.innerHTML = '<option value="">담당자 없음</option>' +
          this.members.map(m => `<option value="${m.id}">${m.email} (${m.is_owner ? '★리더' : '멤버'})</option>`).join('');
      }
    } catch (e) { if (e.status !== 401) console.error(e.message); }
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
        const el = document.getElementById(`col-${col}`);
        const titleEl = document.getElementById(`col-title-${col}`);
        if (!el) return;
        const items = this.tasks.filter(t => t.status === col);
        if (titleEl) titleEl.textContent = `${col} · ${items.length}`;
        el.innerHTML = this._colHTML(col, items);
      });
    }
  },

  _colHTML(col, items) {
    if (!items.length) {
      return col === 'TODO'
        ? `<div class="text-center py-6">
            <div class="text-3xl mb-2">📋</div>
            <p class="text-xs text-gray-400 mb-3">카드 없음</p>
            <button onclick="KanbanPage._showInlineAdd()" class="text-xs text-teal-600 border border-teal-300 rounded-full px-3 py-1 hover:bg-teal-50">+ 첫 태스크 만들기</button>
          </div>`
        : `<div class="text-center py-6"><div class="text-3xl mb-2">📋</div><p class="text-xs text-gray-400">카드 없음</p></div>`;
    }
    return items.map(t => {
      const assigneeLabel = t.assignee_id ? `@${this._getAssigneeEmail(t.assignee_id)}` : null;
      return `
        <div draggable="true"
             ondragstart="KanbanPage._dragStart(event,${t.id})"
             onclick="KanbanPage._openDetail(${t.id})"
             class="bg-white rounded-lg p-3 shadow-sm cursor-pointer text-sm select-none">
          <div class="flex justify-between items-start gap-1">
            <span class="break-words">${t.title}</span>
            ${(this.isOwner || t.creator_id === Auth.getUser()?.id)
              ? `<button onclick="event.stopPropagation(); KanbanPage._confirmDelete(${t.id})"
                         class="text-gray-300 hover:text-red-400 flex-shrink-0 ml-1 text-xs">✕</button>`
              : ''}
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
    el.innerHTML = this._colHTML(col, items);
  },

  _dragStart(e, id) {
    this._dragging = true;
    e.dataTransfer.setData('taskId', id);
  },

  _onDragOver(e, col) {
    e.preventDefault();
    const el = document.getElementById(`col-${col}`);
    if (el) el.classList.add('bg-teal-50', 'ring-2', 'ring-teal-300');
  },

  _onDragLeave(e, col) {
    const el = document.getElementById(`col-${col}`);
    if (el) el.classList.remove('bg-teal-50', 'ring-2', 'ring-teal-300');
  },

  async _drop(e, status) {
    this._dragging = false;
    const el = document.getElementById(`col-${status}`);
    if (el) el.classList.remove('bg-teal-50', 'ring-2', 'ring-teal-300');
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
    document.getElementById('kb-inline-form').classList.remove('hidden');
    document.getElementById('kb-new-title').focus();
    const sel = document.getElementById('kb-new-assignee');
    if (sel && this.members.length) {
      sel.innerHTML = '<option value="">담당자 없음</option>' +
        this.members.map(m => `<option value="${m.id}">${m.email} (${m.is_owner ? '★리더' : '멤버'})</option>`).join('');
    }
  },

  _hideInlineAdd() {
    document.getElementById('kb-inline-form').classList.add('hidden');
    document.getElementById('kb-new-title').value = '';
    const sel = document.getElementById('kb-new-assignee');
    if (sel) sel.value = '';
  },

  async _addTask() {
    const title = document.getElementById('kb-new-title').value.trim();
    if (!title) return;
    const assignee_id = document.getElementById('kb-new-assignee')?.value || null;
    try {
      const task = await apiFetch(`/teams/${this.teamId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, assignee_id: assignee_id ? parseInt(assignee_id) : null }),
      });
      this.tasks.unshift(task);
      this._renderTasks();
      this._hideInlineAdd();
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },

  _openDetail(id) {
    if (this._dragging) return;
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    const assigneeEmail = task.assignee_id ? (this.members.find(m => m.id === task.assignee_id)?.email || '') : '';
    const createdAt = task.created_at ? new Date(task.created_at).toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
    const memberOptions = '<option value="">담당자 없음</option>' +
      this.members.map(m => `<option value="${m.id}" ${m.id === task.assignee_id ? 'selected' : ''}>${m.email} (${m.is_owner ? '★리더' : '멤버'})</option>`).join('');

    document.getElementById('kb-detail-content').innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <span class="text-xs text-gray-400">#${task.id}</span>
        <button onclick="document.getElementById('kb-detail-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>
      <input id="detail-title" type="text" value="${task.title.replace(/"/g, '&quot;')}"
             class="w-full border rounded-lg px-3 py-2 mb-4 font-medium focus:outline-none focus:ring-2 focus:ring-teal-400">
      <p class="text-xs text-gray-500 mb-2">상태</p>
      <div class="flex gap-2 mb-4">
        ${['TODO','DOING','DONE'].map(s => `
          <button onclick="KanbanPage._detailPatchStatus(${id},'${s}')"
                  class="flex-1 py-1.5 rounded text-xs font-medium border ${task.status===s ? 'bg-teal-600 text-white border-teal-600' : 'text-gray-600 hover:bg-gray-50'}">${s}</button>`).join('')}
      </div>
      <p class="text-xs text-gray-500 mb-2">담당자</p>
      <select id="detail-assignee" class="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
        ${memberOptions}
      </select>
      <div class="text-xs text-gray-400 mb-4">생성시각: ${createdAt}</div>
      <div class="flex gap-2">
        <button onclick="KanbanPage._saveDetail(${id})" class="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 text-sm">저장</button>
        ${(this.isOwner || task.creator_id === Auth.getUser()?.id)
          ? `<button onclick="KanbanPage._confirmDelete(${id}); document.getElementById('kb-detail-modal').classList.add('hidden')"
                     class="text-red-400 hover:text-red-600 px-3 py-2 text-sm">🗑</button>`
          : ''}
      </div>`;
    document.getElementById('kb-detail-modal').classList.remove('hidden');
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

  _confirmDelete(id) {
    const modal = document.getElementById('kb-delete-confirm');
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
                    class="w-full py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-teal-50">→ ${s}</button>`).join('')}
          <button onclick="document.getElementById('status-menu').remove()" class="w-full py-3 text-gray-400 text-sm">취소</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },
};
