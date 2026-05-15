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
                <div class="text-xs text-gray-400 mt-0.5">초대코드: <span class="font-mono font-bold text-gray-600">${t.invite_code}</span>
                  <button onclick="TeamsPage._copyCode('${t.invite_code}')" id="tp-copy-btn"
                          class="ml-2 text-teal-500 hover:text-teal-700 text-xs">📋 복사</button>
                </div>
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
        listEl.innerHTML = `
          <div class="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-sm text-blue-700">
            ℹ 아직 팀에 소속되지 않았습니다. 팀을 만들거나 초대코드로 합류하세요.
          </div>`;
        formsEl.innerHTML = `
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white rounded-xl shadow p-5">
              <h2 class="font-semibold mb-3 text-gray-700 text-sm">+ 새 팀 만들기</h2>
              <input id="tp-new-name" type="text" placeholder="팀 이름 (1-30자)"
                     class="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
              <div id="tp-create-err" class="hidden mb-2 px-2 py-1.5 rounded bg-red-50 border border-red-300 text-red-700 text-xs"></div>
              <button id="tp-create" class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 text-sm font-medium">만들기</button>
            </div>
            <div class="bg-white rounded-xl shadow p-5">
              <h2 class="font-semibold mb-3 text-gray-700 text-sm">초대코드로 합류</h2>
              <input id="tp-code" type="text" placeholder="FRNT-2026"
                     class="w-full border rounded-lg px-3 py-2 mb-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase">
              <p class="text-xs text-gray-400 mb-2">형식: 대문자4 + 숫자4 (하이픈 포함)</p>
              <div id="tp-join-err" class="hidden mb-2 px-2 py-1.5 rounded text-xs"></div>
              <button id="tp-join" class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 text-sm font-medium">합류</button>
            </div>
          </div>`;
        document.getElementById('tp-create').onclick = () => this._createTeam();
        document.getElementById('tp-join').onclick = () => this._joinTeam();
        document.getElementById('tp-new-name').onkeydown = e => { if (e.key === 'Enter') this._createTeam(); };
        document.getElementById('tp-code').onkeydown = e => { if (e.key === 'Enter') this._joinTeam(); };
      }
    } catch (e) { if (e.status !== 401) this._showError(e.message); }
  },

  async _copyCode(code) {
    const btn = document.getElementById('tp-copy-btn');
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        const el = document.createElement('textarea');
        el.value = code;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      if (btn) { btn.textContent = '✓ 복사됨'; setTimeout(() => { btn.textContent = '📋 복사'; }, 2000); }
    } catch (e) { console.error(e); }
  },

  _select(id, name) {
    localStorage.setItem('currentTeamId', id);
    localStorage.setItem('currentTeamName', name);
    navigate('#kanban');
  },

  _showInviteCode(team) {
    const formsEl = document.getElementById('tp-forms');
    formsEl.innerHTML = `
      <div class="bg-white rounded-xl shadow p-6 text-center">
        <p class="text-green-600 font-semibold mb-4">✓ 팀이 생성되었습니다!</p>
        <p class="text-sm text-gray-500 mb-2">초대코드 (멤버에게 공유)</p>
        <div class="flex items-center justify-center gap-3 mb-4">
          <span class="font-mono text-2xl font-bold tracking-widest text-teal-700">${team.invite_code}</span>
          <button onclick="TeamsPage._copyCode('${team.invite_code}')" id="tp-copy-btn"
                  class="text-teal-500 hover:text-teal-700 text-sm border border-teal-300 rounded px-2 py-1">📋 복사</button>
        </div>
        <button onclick="TeamsPage._select(${team.id},'${team.name.replace(/'/g, "\\'")}')"
                class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium">
          칸반 시작하기 →
        </button>
      </div>`;
  },

  _showJoinPreview(team) {
    const formsEl = document.getElementById('tp-forms');
    formsEl.innerHTML = `
      <div class="bg-white rounded-xl shadow p-6 text-center">
        <p class="text-green-600 font-semibold mb-3">✓ ${team.name} 팀이 확인되었습니다!</p>
        <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
          <div class="font-semibold text-gray-800 text-base">${team.name}</div>
          ${team.member_count ? `<div class="text-xs text-gray-400 mt-1">멤버 ${team.member_count}명</div>` : ''}
        </div>
        <button onclick="TeamsPage._select(${team.id},'${team.name.replace(/'/g, "\\'")}')"
                class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-medium">
          이 팀에 합류 →
        </button>
      </div>`;
  },

  async _createTeam() {
    const name = document.getElementById('tp-new-name').value.trim();
    if (!name) return;
    try {
      const team = await apiFetch('/teams', { method: 'POST', body: JSON.stringify({ name }) });
      const listEl = document.getElementById('tp-list');
      listEl.innerHTML = '';
      this._showInviteCode(team);
    } catch (e) { if (e.status !== 401) this._showError(e.message); }
  },

  async _joinTeam() {
    const code = document.getElementById('tp-code').value.trim().toUpperCase();
    if (!code) return;
    const errEl = document.getElementById('tp-join-err');
    if (errEl) { errEl.textContent = ''; errEl.classList.add('hidden'); }
    try {
      const team = await apiFetch('/teams/join', { method: 'POST', body: JSON.stringify({ invite_code: code }) });
      const listEl = document.getElementById('tp-list');
      listEl.innerHTML = '';
      this._showJoinPreview(team);
    } catch (e) {
      if (e.status === 401) return;
      if (errEl) {
        errEl.textContent = e.message;
        errEl.classList.remove('hidden');
        if (e.status === 409) {
          errEl.className = 'mb-2 px-2 py-1.5 rounded text-xs bg-yellow-50 border border-yellow-300 text-yellow-700';
        } else {
          errEl.className = 'mb-2 px-2 py-1.5 rounded text-xs bg-red-50 border border-red-300 text-red-700';
        }
      }
    }
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
