(function () {
  const THEME_CLASSES = {
    dark: {
      brand: 'text-white',
      active: 'bg-white text-slate-950 hover:bg-slate-200',
      inactive: 'border border-white/20 text-white hover:bg-white/10',
      text: 'text-slate-300',
    },
    light: {
      brand: 'text-slate-900',
      active: 'bg-slate-900 text-white',
      inactive: 'border border-slate-300 text-slate-700 hover:bg-white',
      text: 'text-slate-600',
    },
  };

  const BASE_LINK_CLASSES = 'rounded-lg px-3 py-2 font-semibold transition';
  const AUTH_NAV_LINK_CLASSES =
    'px-1 py-2 font-semibold text-slate-600 transition hover:text-slate-950';
  const AUTH_NAV_ACTIVE_CLASSES = 'border-b-2 border-slate-900 text-slate-950';
  const AUTH_LOGOUT_CLASSES =
    'px-1 py-2 font-semibold text-slate-600 transition hover:text-slate-950';

  function createAction(action, theme) {
    if (action.type === 'user') {
      return `<span id="user-name" class="hidden text-sm font-semibold ${theme.text} sm:inline"></span>`;
    }

    const classes = `${BASE_LINK_CLASSES} ${
      action.active ? theme.active : theme.inactive
    }`;

    if (action.type === 'button') {
      return `<button id="${action.id}" type="button" class="${classes}">${action.label}</button>`;
    }

    if (action.type === 'label') {
      return `<span class="${classes}">${action.label}</span>`;
    }

    return `<a href="${action.href}" class="${classes}">${action.label}</a>`;
  }

  function createAuthenticatedNavItem(action) {
    const classes = `${AUTH_NAV_LINK_CLASSES} ${
      action.active ? AUTH_NAV_ACTIVE_CLASSES : ''
    }`;

    if (action.type === 'label') {
      return `<span class="${classes}">${action.label}</span>`;
    }

    return `<a href="${action.href}" class="${classes}">${action.label}</a>`;
  }

  function getPublicActions(active) {
    return [
      { href: '/login.html', label: 'Login', active: active === 'login' },
      {
        href: '/register.html',
        label: 'Cadastro',
        active: active === 'register',
      },
    ];
  }

  function getAuthenticatedNavActions(active) {
    const actions = [
      {
        href: '/dashboard.html',
        label: 'Dashboard',
        active: active === 'dashboard',
      },
    ];

    if (active === 'host') {
      actions.push({ type: 'label', label: 'Detalhes', active: true });
    }

    actions.push({ href: '/api/docs', label: 'API Docs' });

    return actions;
  }

  function renderNavbar({
    active,
    authenticated = false,
    containerId = 'app-navbar',
    showUser = false,
    theme = 'light',
  } = {}) {
    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    const selectedTheme = THEME_CLASSES[theme] ?? THEME_CLASSES.light;
    const brandHref = authenticated ? '/dashboard.html' : '/';
    const publicActions = getPublicActions(active)
      .map((action) => createAction(action, selectedTheme))
      .join('');
    const authenticatedNavActions = getAuthenticatedNavActions(active)
      .map(createAuthenticatedNavItem)
      .join('');
    const userAction = showUser
      ? `<span id="user-name" class="hidden text-sm font-semibold ${selectedTheme.text} sm:inline"></span>`
      : '';

    container.innerHTML = `<nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <a href="${brandHref}" class="text-sm font-bold tracking-[0.18em] ${selectedTheme.brand}">HOST MONITOR</a>
      ${
        authenticated
          ? `<div class="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm">
              <div class="flex items-center gap-4">${authenticatedNavActions}</div>
              <div class="flex items-center gap-4 border-slate-300 sm:border-l sm:pl-6">
                ${userAction}
                <button id="logout-button" type="button" class="${AUTH_LOGOUT_CLASSES}">Sair</button>
              </div>
            </div>`
          : `<div class="flex flex-wrap items-center justify-end gap-2 text-sm">${publicActions}</div>`
      }
    </nav>`;
  }

  window.HostMonitorNavbar = {
    renderNavbar,
  };
})();
