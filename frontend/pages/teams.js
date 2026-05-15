const TeamsPage = {
  render() {
    document.getElementById('app').innerHTML = `
      <div class="max-w-lg mx-auto mt-10 px-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-teal-600">내 팀</h1>
          <button id="tp-logout" class="text-sm text-gray-400 hover:text-red-500">로그아웃</button>
        </div>
        <div id="tp-list" class="mb-6 space-y-3"></div>
        <div class="bg-white rounded-xl shadow p-5 mb-4">
          <h2 class="font-semibold mb-3 text-gray-700">팀 만들기</h2>
          <input id="tp-new-name" type="text" placeholder="팀 이름"
                 class="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400">
          <button id="tp-create" class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">만들기</button>
        </div>
        <div class="bg-white rounded-xl shadow p-5">
          <h2 class="font-semibold mb-3 text-gray-700">초대코드로 합류</h2>
          <input id="tp-code" type="text" placeholder="ABCD-1234"
                 class="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400">
          <button id="tp-join" class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">합류하기</button>
        </div>
        <p id="tp-error" class="text-red-500 text-sm mt-3 text-center hidden"></p>
      </div>`;
    document.getElementById('tp-logout').onclick = () => { Auth.logout(); navigate('#login'); };
    document.getElementById('tp-create').onclick = () => this._createTeam();
    document.getElementById('tp-join').onclick = () => this._joinTeam();
    document.getElementById('tp-new-name').onkeydown = e => { if (e.key === 'Enter') this._createTeam(); };
    document.getElementById('tp-code').onkeydown = e => { if (e.key === 'Enter') this._joinTeam(); };
    this._loadTeams();
  },

  async _loadTeams() {
    try {
      const teams = await apiFetch('/teams');
      const el = document.getElementById('tp-list');
      if (!teams.length) {
        el.innerHTML = '<p class="text-gray-400 text-center text-sm">소속된 팀이 없습니다</p>';
        return;
      }
      el.innerHTML = teams.map(t => `
        <div onclick="TeamsPage._select(${t.id},'${t.name.replace(/'/g, "\\'")}')"
             class="bg-white rounded-xl shadow p-4 flex justify-between items-center cursor-pointer hover:bg-teal-50 transition">
          <div>
            <div class="font-semibold text-gray-800">${t.name}</div>
            <div class="text-xs text-gray-400 mt-0.5">초대코드: <span class="font-mono">${t.invite_code}</span></div>
          </div>
          <span class="text-teal-500 text-lg">›</span>
        </div>`).join('');
    } catch (e) { this._showError(e.message); }
  },

  _select(id, name) {
    localStorage.setItem('currentTeamId', id);
    localStorage.setItem('currentTeamName', name);
    navigate('#kanban');
  },

  async _createTeam() {
    const name = document.getElementById('tp-new-name').value.trim();
    if (!name) return;
    try {
      await apiFetch('/teams', { method: 'POST', body: JSON.stringify({ name }) });
      document.getElementById('tp-new-name').value = '';
      this._loadTeams();
    } catch (e) { this._showError(e.message); }
  },

  async _joinTeam() {
    const code = document.getElementById('tp-code').value.trim();
    if (!code) return;
    try {
      await apiFetch('/teams/join', { method: 'POST', body: JSON.stringify({ invite_code: code }) });
      document.getElementById('tp-code').value = '';
      this._loadTeams();
    } catch (e) { this._showError(e.message); }
  },

  _showError(msg) {
    const el = document.getElementById('tp-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  },
};
