const NavBar = {
  render(container, { teamName, activePage, onLogout }) {
    const tabs = [
      { id: 'kanban', label: '칸반', href: '#kanban' },
      { id: 'chat',   label: '채팅',  href: '#chat'   },
      { id: 'members',label: '멤버', href: '#members' },
    ];

    const tabHTML = tabs.map(t => {
      const isActive = t.id === activePage;
      return `<button onclick="navigate('${t.href}')"
                class="w-16 text-center text-sm py-1 transition-colors
                       ${isActive
                         ? 'text-white font-medium border-b-2 border-white'
                         : 'text-teal-200 hover:text-white border-b-2 border-transparent'}">
                ${t.label}
              </button>`;
    }).join('');

    const email = Auth.getUser()?.email || '';
    const teamSafe = (teamName || '').replace(/'/g, "\\'");

    container.innerHTML = `
      <header class="bg-teal-600 text-white px-4 py-3 flex items-center flex-shrink-0" style="min-height:52px">
        <!-- 좌: 로고 + 팀명 -->
        <div class="flex items-center gap-2 min-w-0" style="min-width:160px">
          <button id="nb-hamburger" class="md:hidden p-1 flex-shrink-0">☰</button>
          <span class="font-bold hidden md:inline flex-shrink-0">TaskFlow</span>
          <span class="text-teal-300 hidden md:inline flex-shrink-0">|</span>
          <span class="font-medium truncate">${teamName || ''}</span>
        </div>

        <!-- 중: 탭 3개 (중앙 고정) -->
        <div class="hidden md:flex items-center gap-1 flex-1 justify-center">
          ${tabHTML}
        </div>

        <!-- 우: 이메일 + 로그아웃 -->
        <div class="hidden md:flex items-center gap-2 flex-shrink-0 justify-end" style="min-width:160px">
          <span class="text-teal-200 text-sm truncate max-w-32">${email}</span>
          <button id="nb-logout" class="text-sm text-teal-200 hover:text-white flex-shrink-0">로그아웃</button>
        </div>
      </header>

      <!-- 모바일 메뉴 -->
      <div id="nb-mobile-menu" class="hidden md:hidden fixed inset-0 z-30 bg-black/50" onclick="this.classList.add('hidden')">
        <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6 space-y-4" onclick="event.stopPropagation()">
          <div class="font-bold text-teal-600">TaskFlow</div>
          <div class="font-semibold text-gray-700 text-sm">${teamName || ''}</div>
          <div class="text-xs text-gray-400 truncate">${email}</div>
          <hr>
          ${tabs.map(t => `
            <button onclick="navigate('${t.href}'); document.getElementById('nb-mobile-menu').classList.add('hidden')"
                    class="flex items-center gap-2 w-full py-2 text-sm
                           ${t.id === activePage ? 'text-teal-600 font-medium' : 'text-gray-700'}">
              ${t.id === 'kanban' ? '📋' : t.id === 'chat' ? '💬' : '👥'} ${t.label}
            </button>`).join('')}
          <hr>
          <button id="nb-logout-mobile" class="flex items-center gap-2 w-full py-2 text-red-500 text-sm">🚪 로그아웃</button>
        </div>
      </div>`;

    document.getElementById('nb-logout')?.addEventListener('click', onLogout);
    document.getElementById('nb-logout-mobile')?.addEventListener('click', onLogout);
    document.getElementById('nb-hamburger')?.addEventListener('click', () => {
      document.getElementById('nb-mobile-menu')?.classList.remove('hidden');
    });
  },
};
