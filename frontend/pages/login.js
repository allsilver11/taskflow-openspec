const LoginPage = {
  _mode: 'login',

  render(mode) {
    this._mode = mode || 'login';
    const isSignup = this._mode === 'signup';
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-teal-600 mb-1">TaskFlow</h1>
            <h2 class="text-lg font-semibold text-gray-700">${isSignup ? '회원가입' : '로그인'}</h2>
          </div>
          <div class="mb-3">
            <input id="lp-email" type="email" placeholder="이메일"
                   class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
            <div id="lp-email-err" class="hidden mt-1 px-3 py-2 rounded bg-red-50 border border-red-300 text-red-700 text-xs"></div>
          </div>
          <div class="mb-5">
            <input id="lp-password" type="password" placeholder="비밀번호 (8자 이상)"
                   class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
            <div id="lp-pw-err" class="hidden mt-1 px-3 py-2 rounded bg-red-50 border border-red-300 text-red-700 text-xs"></div>
          </div>
          <button id="lp-submit" class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium mb-4">
            ${isSignup ? '가입하기' : '로그인'}
          </button>
          <div id="lp-general-err" class="hidden mb-3 px-3 py-2 rounded bg-red-50 border border-red-300 text-red-700 text-sm text-center"></div>
          <p class="text-center text-sm text-gray-500">
            ${isSignup
              ? `이미 계정이 있으신가요? <button id="lp-switch" class="text-teal-600 font-medium hover:underline">로그인</button>`
              : `계정이 없으신가요? <button id="lp-switch" class="text-teal-600 font-medium hover:underline">회원가입</button>`}
          </p>
        </div>
      </div>`;
    document.getElementById('lp-submit').onclick = () => this._submit();
    document.getElementById('lp-switch').onclick = () => this.render(isSignup ? 'login' : 'signup');
    document.getElementById('lp-password').onkeydown = e => { if (e.key === 'Enter') this._submit(); };
  },

  _setLoading(loading) {
    const btn = document.getElementById('lp-submit');
    if (!btn) return;
    btn.disabled = loading;
    if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
    btn.textContent = loading ? '처리중…' : btn.dataset.label;
  },

  _clearErrors() {
    ['lp-email-err', 'lp-pw-err', 'lp-general-err'].forEach(id => {
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
    const el = document.getElementById('lp-general-err');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  },

  async _submit() {
    this._clearErrors();
    const email = document.getElementById('lp-email').value.trim();
    const password = document.getElementById('lp-password').value;
    const mode = this._mode;

    if (!email) { this._showFieldError('lp-email-err', '이메일을 입력해주세요'); return; }
    if (!email.includes('@')) { this._showFieldError('lp-email-err', '⚠ 올바른 이메일 형식이 아닙니다'); return; }
    if (!password) { this._showFieldError('lp-pw-err', '비밀번호를 입력해주세요'); return; }
    if (mode === 'signup' && password.length < 8) { this._showFieldError('lp-pw-err', '⚠ 8자 이상 입력해주세요'); return; }

    this._setLoading(true);
    try {
      const data = await apiFetch(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      Auth.setToken(data.token);
      Auth.setUser(data.user);
      navigate('#teams');
    } catch (e) {
      this._setLoading(false);
      if (e.code === 'EMAIL_TAKEN') {
        this._showFieldError('lp-email-err', '✕ 이미 가입된 이메일입니다');
      } else {
        this._showError(e.message);
      }
    }
  },
};
