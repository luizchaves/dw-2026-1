import { Activity, LogOut } from 'lucide-react';

import type { AppRoute } from '../App';
import type { User } from '../types';

type NavbarProps = {
  active?: AppRoute;
  authenticated?: boolean;
  onLogout?: () => void;
  navigate: (path: string) => void;
  theme?: 'light' | 'dark';
  user?: User | null;
};

export function Navbar({
  active,
  authenticated = false,
  navigate,
  onLogout,
  theme = 'light',
  user,
}: NavbarProps) {
  return (
    <nav className={`navbar navbar-${theme}`}>
      <button
        className="brand-button"
        type="button"
        onClick={() => navigate(authenticated ? '/dashboard' : '/')}
      >
        <Activity size={18} />
        <span>HOST MONITOR</span>
      </button>

      {authenticated ? (
        <div className="nav-auth-actions">
          <button
            className={active === 'dashboard' ? 'nav-link active' : 'nav-link'}
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          {active === 'host' ? <span className="nav-link active">Detalhes</span> : null}
          <a className="nav-link" href="/api/docs">
            API Docs
          </a>
          <span className="user-name">{user?.name}</span>
          <button className="nav-link logout-button" type="button" onClick={onLogout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      ) : (
        <div className="nav-public-actions">
          <button
            className={active === 'login' ? 'nav-pill active' : 'nav-pill'}
            type="button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className={active === 'register' ? 'nav-pill active' : 'nav-pill'}
            type="button"
            onClick={() => navigate('/register')}
          >
            Cadastro
          </button>
        </div>
      )}
    </nav>
  );
}
