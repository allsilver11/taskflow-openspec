async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail || data;
    const err = new Error(detail?.msg || detail?.message || '오류가 발생했습니다');
    err.status = res.status;
    err.code = detail?.code;
    throw err;
  }
  return data;
}
