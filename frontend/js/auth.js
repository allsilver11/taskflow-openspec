const Auth = {
  getToken() { return localStorage.getItem('token'); },
  setToken(t) { localStorage.setItem('token', t); },
  removeToken() { localStorage.removeItem('token'); },
  isLoggedIn() { return !!this.getToken(); },
  setUser(u) { localStorage.setItem('user', JSON.stringify(u)); },
  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
