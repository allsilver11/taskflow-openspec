const TeamsPage = {
  render() {
    document.getElementById('app').innerHTML = `
      <div class="max-w-lg mx-auto mt-10 px-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-teal-600">내 팀</h1>
          <button id="tp-logout" class="text-sm text-gray-400 hover:text-red-500">로그아웃</button>
        </div>
        <div id="tp-list" class="mb-6"></div>
        <div id="tp-forms"></div>
        <p id="tp-error" class="text-red-500 text-sm mt-3 text-center hidden"></p>
      </div>`;
    document.getElementById('tp-logout').onclick = () => { Auth.logout(); navigate('#login'); };
    this._loadTeams();
  },

  async _loadTeams() {
    try {
      const teams = await apiFetch('/teams');
      const listEl = document.getElementById('tp-list');
      const formsEl = document.getElementById('tp-forms');

      if (teams.length) {
        const t = teams[0];
        listEl.innerHTML = `
          <div class="bg-white rounded-xl shadow p-4 mb-4">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-semibold text-gray-800">${t.name}</div>
                <div class="text-xs text-gray-400 mt-0.5">초대코드: <span class="font-mono">${t.invite_code}</span></div>
              </div>
              <div class="flex gap-2 items-center">
                <button onclick="TeamsPage._leave(${t.id})" class="text-xs text-red-400 hover:text-red-600">떠나기</button>
                <button onclick="TeamsPage._select(${t.id},'${t.name.replace(/'/g, "\\'")}')"
                        class="bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-teal-700">입장 →</button>
              </div>
            </div>
          </div>`;
        formsEl.innerHTML = '<p class="text-xs text-gray-400 text-center">팀을 떠나야 다른 팀에 합류할 수 있습니다 (1인 1팀)</p>';
      } else {
        listEl.innerHTML = '<p class="text-gray-400 text-center text-sm mb-4">소속된 팀이 없습니다</p>';
        formsEl.innerHTML = `
          <div class="bg-white rounded-xl shadow p-5 mb-4">
            <h2 class="font-semibold mb-3 text-gray-700">팀 만들기</h2>
            <input id="tp-new-name" type="text" placeholder="팀 이름 (1-30자)"
                   class="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400">
            <button id="tp-create" class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">만들기</button>
          </div>
          <div class="bg-white rounded-xl shadow p-5">
            <h2 class="font-semibold mb-3 text-gray-700">초대코드로 합류</h2>
            <input id="tp-code" type="text" placeholder="FRNT-2026"
                   class="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400">
            <button id="tp-join" class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">합류하기</button>
          </div>`;
        document.getElementById('tp-create').onclick = () => this._createTeam();
        document.getElementById('tp-join').onclick = () => this._joinTeam();
        document.getElementById('tp-new-name').onkeydown = e => { if (e.key === 'Enter') this._createTeam(); };
        document.getElementById('tp-code').onkeydown = e => { if (e.key === 'Enter') this._joinTeam(); };
      }
    } catch (e) { if (e.status !== 401) this._showError(e.message); }
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
      const team = await apiFetch('/teams', { method: 'POST', body: JSON.stringify({ name }) });
      this._select(team.id, team.name);
    } catch (e) { if (e.status !== 401) this._showError(e.message); }
  },

  async _joinTeam() {
    const code = document.getElementById('tp-code').value.trim().toUpperCase();
    if (!code) return;
    try {
      const team = await apiFetch('/teams/join', { method: 'POST', body: JSON.stringify({ invite_code: code }) });
      this._select(team.id, team.name);
    } catch (e) { if (e.status !== 401) this._showError(e.message); }
  },

  async _leave(teamId) {
    if (!confirm('팀을 떠나시겠습니까?')) return;
    try {
      await apiFetch(`/teams/${teamId}/leave`, { method: 'DELETE' });
      this._loadTeams();
    } catch (e) { if (e.status !== 401) this._showError(e.message); }
  },

  _showError(msg) {
    const el = document.getElementById('tp-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  },
};
