const MembersPage = {
  teamId: null,
  teamName: null,

  render() {
    this.teamId = localStorage.getItem('currentTeamId');
    this.teamName = localStorage.getItem('currentTeamName');
    if (!this.teamId) { navigate('#teams'); return; }

    document.getElementById('app').innerHTML = `
      <div class="flex flex-col" style="height:100vh">
        <header class="bg-teal-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <button onclick="navigate('#teams')" class="text-sm opacity-80 hover:opacity-100 hidden md:inline">← 팀 목록</button>
            <button id="mp-hamburger" class="md:hidden p-1">☰</button>
            <span class="font-bold truncate max-w-32 md:max-w-none">${this.teamName}</span>
          </div>
          <nav class="hidden md:flex items-center gap-1">
            <button onclick="navigate('#kanban')" class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">칸반</button>
            <button onclick="navigate('#chat')" class="px-3 py-1 rounded text-teal-100 hover:bg-teal-500 text-sm">채팅</button>
            <button onclick="navigate('#members')" class="px-3 py-1 rounded bg-teal-500 text-white text-sm font-medium">멤버</button>
            <span class="text-teal-200 text-sm ml-2">${Auth.getUser()?.email || ''}</span>
          </nav>
        </header>

        <!-- Mobile menu -->
        <div id="mp-mobile-menu" class="hidden md:hidden fixed inset-0 z-30 bg-black/50" onclick="this.classList.add('hidden')">
          <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6 space-y-4" onclick="event.stopPropagation()">
            <div class="font-semibold text-gray-700">${Auth.getUser()?.email || ''}</div>
            <div class="text-xs text-gray-400">${this.teamName}</div>
            <hr>
            <button onclick="navigate('#kanban'); document.getElementById('mp-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">📋 칸반</button>
            <button onclick="navigate('#chat'); document.getElementById('mp-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-gray-700">💬 채팅</button>
            <button onclick="navigate('#members'); document.getElementById('mp-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-teal-600 font-medium">👥 멤버</button>
            <hr>
            <button onclick="Auth.logout(); navigate('#login')" class="flex items-center gap-2 w-full py-2 text-red-500">🚪 로그아웃</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
          <h2 class="font-semibold text-gray-700 mb-4">팀멤버</h2>
          <div id="mp-list" class="space-y-3">
            <p class="text-gray-400 text-sm text-center py-8">불러오는 중...</p>
          </div>
        </div>
      </div>`;

    document.getElementById('mp-hamburger').onclick = () => document.getElementById('mp-mobile-menu').classList.remove('hidden');
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
