const ROUTES = {
  '#login': () => LoginPage.render(),
  '#teams': () => TeamsPage.render(),
  '#kanban': () => KanbanPage.render(),
  '#chat': () => ChatPage.render(),
  '#members': () => MembersPage.render(),
};

function navigate(hash) {
  window.location.hash = hash;
}

function _cleanup() {
  if (window._pollingInterval) {
    clearInterval(window._pollingInterval);
    window._pollingInterval = null;
  }
}

function _handleRoute() {
  _cleanup();
  const hash = window.location.hash || '#login';
  if (hash !== '#login' && !Auth.isLoggedIn()) {
    navigate('#login');
    return;
  }
  const render = ROUTES[hash];
  if (render) render();
  else navigate(Auth.isLoggedIn() ? '#teams' : '#login');
}

window.addEventListener('hashchange', _handleRoute);
window.addEventListener('load', _handleRoute);
window.navigate = navigate;
