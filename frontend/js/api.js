async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    Auth.logout();
    window.location.hash = '#login';
    const e = new Error('인증이 만료되었습니다');
    e.status = 401;
    throw e;
  }

  if (!res.ok) {
    const detail = data.error || data.detail?.error || data.detail || data;
    const e = new Error(detail?.message || detail?.msg || '오류가 발생했습니다');
    e.status = res.status;
    e.code = detail?.code;
    throw e;
  }
  return data;
}
