import { useCallback, useMemo, useState } from 'react';

import { clearSession, getUser, hasSession } from './lib/session';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { HostDetailsPage } from './pages/HostDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { User } from './types';

export type AppRoute = 'home' | 'login' | 'register' | 'dashboard' | 'host';

function readRoute(): { name: AppRoute; hostId?: string } {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  if (path === '/login') {
    return { name: 'login' };
  }

  if (path === '/register') {
    return { name: 'register' };
  }

  if (path === '/dashboard') {
    return { name: 'dashboard' };
  }

  if (path === '/host') {
    return { name: 'host', hostId: params.get('id') ?? undefined };
  }

  return { name: 'home' };
}

export function App() {
  const [route, setRoute] = useState(readRoute);
  const [user, setUser] = useState<User | null>(() => getUser());
  const authenticated = hasSession();

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    setRoute(readRoute());
  }, []);

  useMemo(() => {
    window.onpopstate = () => setRoute(readRoute());
  }, []);

  const handleAuthenticated = useCallback(() => {
    setUser(getUser());
    navigate('/dashboard');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  if (authenticated && (route.name === 'home' || route.name === 'login' || route.name === 'register')) {
    return <DashboardPage navigate={navigate} onLogout={handleLogout} user={user} />;
  }

  if (!authenticated && (route.name === 'dashboard' || route.name === 'host')) {
    return <LoginPage navigate={navigate} onAuthenticated={handleAuthenticated} />;
  }

  switch (route.name) {
    case 'login':
      return <LoginPage navigate={navigate} onAuthenticated={handleAuthenticated} />;
    case 'register':
      return <RegisterPage navigate={navigate} onAuthenticated={handleAuthenticated} />;
    case 'dashboard':
      return <DashboardPage navigate={navigate} onLogout={handleLogout} user={user} />;
    case 'host':
      return (
        <HostDetailsPage
          hostId={route.hostId}
          navigate={navigate}
          onLogout={handleLogout}
          user={user}
        />
      );
    default:
      return <HomePage navigate={navigate} />;
  }
}
