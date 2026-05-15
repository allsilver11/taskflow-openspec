const LoginPage = {
  render() {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <h1 class="text-2xl font-bold text-center mb-1 text-teal-600">TaskFlow</h1>
          <p class="text-center text-gray-400 text-sm mb-6">팀 칸반 + 채팅</p>
          <input id="lp-email" type="email" placeholder="이메일"
                 class="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400">
          <input id="lp-password" type="password" placeholder="비밀번호 (8자 이상)"
                 class="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400">
          <button id="lp-login" class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 mb-2 font-medium">
            로그인
          </button>
          <button id="lp-signup" class="w-full border border-teal-600 text-teal-600 py-2 rounded-lg hover:bg-teal-50 font-medium">
            회원가입
          </button>
          <p id="lp-error" class="text-red-500 text-sm mt-3 text-center hidden"></p>
        </div>
      </div>`;
    document.getElementById('lp-login').onclick = () => this._submit('login');
    document.getElementById('lp-signup').onclick = () => this._submit('signup');
    document.getElementById('lp-password').onkeydown = e => { if (e.key === 'Enter') this._submit('login'); };
  },

  _showError(msg) {
    const el = document.getElementById('lp-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  },

  async _submit(mode) {
    const email = document.getElementById('lp-email').value.trim();
    const password = document.getElementById('lp-password').value;
    if (!email || !password) { this._showError('이메일과 비밀번호를 입력해주세요'); return; }
    if (mode === 'signup' && password.length < 8) { this._showError('비밀번호는 8자 이상이어야 합니다'); return; }
    try {
      const data = await apiFetch(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      Auth.setToken(data.token);
      Auth.setUser(data.user);
      navigate('#teams');
    } catch (e) {
      this._showError(e.message);
    }
  },
};
