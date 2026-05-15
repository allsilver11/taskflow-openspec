const MembersPage = {
  teamId: null,
  teamName: null,

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <div id="nb-container"></div>

        <div class="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
          <h2 class="font-semibold text-gray-700 mb-4">팀멤버</h2>
          <div id="mp-list" class="space-y-3">
            <p class="text-gray-400 text-sm text-center py-8">불러오는 중...</p>
          </div>
        </div>
      </div>`;

    NavBar.render(document.getElementById('nb-container'), {
      teamName: this.teamName,
      activePage: 'members',
      onLogout: () => { Auth.logout(); navigate('#login'); },
    });
    this._load();
  },

  async _load() {
    try {
      const members = await apiFetch(`/teams/${this.teamId}/members`);
      const el = document.getElementById('mp-list');
      if (!members.length) { el.innerHTML = '<p class="text-gray-400 text-center py-8">멤버가 없습니다</p>'; return; }
      const sorted = [...members].sort((a, b) => (b.is_owner ? 1 : 0) - (a.is_owner ? 1 : 0));
      const me = Auth.getUser()?.id;
      el.innerHTML = sorted.map(m => `
        <div class="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
            ${m.email[0].toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-800 truncate">${m.email}</span>
              ${m.is_owner ? '<span class="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">★ owner</span>' : '<span class="text-xs text-gray-400">member</span>'}
              ${m.id === me ? '<span class="text-xs text-teal-500">(나)</span>' : ''}
            </div>
          </div>
        </div>`).join('');
    } catch (e) { if (e.status !== 401) console.error(e.message); }
  },
};
