(function () {
  const TOKEN_KEY = 'hostMonitorToken';
  const USER_KEY = 'hostMonitorUser';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
  }

  function setSession({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function redirectIfAuthenticated() {
    if (getToken()) {
      window.location.href = '/dashboard.html';
    }
  }

  function requireAuth() {
    const token = getToken();

    if (!token) {
      window.location.href = '/login.html';
      throw new Error('Missing auth token');
    }

    return {
      token,
      user: getUser(),
    };
  }

  function fetchWithAuth(url, options = {}) {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${getToken()}`,
      },
    });
  }

  function setupAuthenticatedNavbar({ active }) {
    const { user } = requireAuth();

    HostMonitorNavbar.renderNavbar({
      active,
      authenticated: true,
      showUser: true,
    });

    const userName = document.getElementById('user-name');

    if (user?.name) {
      userName.textContent = user.name;
      userName.classList.remove('hidden');
    }

    document.getElementById('logout-button').addEventListener('click', () => {
      clearSession();
      window.location.href = '/login.html';
    });
  }

  window.HostMonitorSession = {
    clearSession,
    fetchWithAuth,
    getToken,
    getUser,
    redirectIfAuthenticated,
    requireAuth,
    setSession,
    setupAuthenticatedNavbar,
  };
})();
