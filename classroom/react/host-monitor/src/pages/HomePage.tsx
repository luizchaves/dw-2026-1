import { Navbar } from '../components/Navbar';

type HomePageProps = {
  navigate: (path: string) => void;
};

export function HomePage({ navigate }: HomePageProps) {
  return (
    <main className="home-page">
      <Navbar navigate={navigate} theme="dark" />
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow cyan">Monitoramento de hosts</p>
          <h1>Host Monitor</h1>
          <p>
            Acompanhe disponibilidade, latencia e historico dos seus hosts em um painel direto
            para operacao.
          </p>
          <div className="hero-actions">
            <button className="primary-cyan" type="button" onClick={() => navigate('/login')}>
              Entrar
            </button>
            <button className="ghost-dark" type="button" onClick={() => navigate('/register')}>
              Criar conta
            </button>
          </div>
        </div>

        <div className="dashboard-preview">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <strong>dashboard</strong>
          </div>
          <div className="preview-metrics">
            <article className="metric green">
              <span>Online</span>
              <strong>98.5%</strong>
              <i />
            </article>
            <article className="metric blue">
              <span>Latencia</span>
              <strong>12ms</strong>
              <div className="mini-bars">
                <b />
                <b />
                <b />
                <b />
                <b />
              </div>
            </article>
            <article className="metric red">
              <span>Alertas</span>
              <strong>1</strong>
              <i />
            </article>
          </div>
          <div className="preview-list">
            <div>
              <span>
                <strong>Google DNS</strong>
                <small>8.8.8.8</small>
              </span>
              <em className="ok">Online</em>
            </div>
            <div>
              <span>
                <strong>Servidor interno</strong>
                <small>intranet.local</small>
              </span>
              <em className="bad">Offline</em>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
