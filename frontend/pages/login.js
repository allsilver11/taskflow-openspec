const LoginPage = {
  render() {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <h1 class="text-2xl font-bold text-center mb-1 text-teal-600">TaskFlow</h1>
          <p class="text-center text-gray-400 text-sm mb-6">팀 칸반 + 채팅</p>
          <div class="mb-3">
            <input id="lp-email" type="email" placeholder="이메일"
                   class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
            <p id="lp-email-err" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>
          <div class="mb-4">
            <input id="lp-password" type="password" placeholder="비밀번호 (8자 이상)"
                   class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
            <p id="lp-pw-err" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>
          <button id="lp-login" class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 mb-2 font-medium">
            로그인
          </button>
          <button id="lp-signup" class="w-full border border-teal-600 text-teal-600 py-2 rounded-lg hover:bg-teal-50 font-medium">
            가입하기
          </button>
          <p id="lp-error" class="text-red-500 text-sm mt-3 text-center hidden"></p>
        </div>
      </div>`;
    document.getElementById('lp-login').onclick = () => this._submit('login');
    document.getElementById('lp-signup').onclick = () => this._submit('signup');
    document.getElementById('lp-password').onkeydown = e => { if (e.key === 'Enter') this._submit('login'); };
  },

  _setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? '처리중…' : btn.dataset.label;
  },

  _clearErrors() {
    ['lp-email-err', 'lp-pw-err', 'lp-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.classList.add('hidden'); }
    });
  },

  _showFieldError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  },

  _showError(msg) {
    const el = document.getElementById('lp-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  },

  async _submit(mode) {
    this._clearErrors();
    const email = document.getElementById('lp-email').value.trim();
    const password = document.getElementById('lp-password').value;
    const btn = document.getElementById(mode === 'login' ? 'lp-login' : 'lp-signup');
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;

    if (!email) { this._showFieldError('lp-email-err', '이메일을 입력해주세요'); return; }
    if (!email.includes('@')) { this._showFieldError('lp-email-err', '⚠ 올바른 이메일 형식이 아닙니다'); return; }
    if (!password) { this._showFieldError('lp-pw-err', '비밀번호를 입력해주세요'); return; }
    if (mode === 'signup' && password.length < 8) { this._showFieldError('lp-pw-err', '⚠ 8자 이상 입력해주세요'); return; }

    this._setLoading(btn, true);
    try {
      const data = await apiFetch(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      Auth.setToken(data.token);
      Auth.setUser(data.user);
      navigate('#teams');
    } catch (e) {
      this._setLoading(btn, false);
      if (e.code === 'EMAIL_TAKEN') {
        this._showFieldError('lp-email-err', '✕ 이미 가입된 이메일입니다');
      } else {
        this._showError(e.message);
      }
    }
  },
};
