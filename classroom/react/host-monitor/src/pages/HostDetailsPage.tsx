import { useEffect, useState } from 'react';

import { LatencyChart, TimelineChart } from '../components/Charts';
import { Navbar } from '../components/Navbar';
import { formatDate } from '../lib/format';
import { getHostDetails, pingHost } from '../lib/api';
import type { HostDetails, User } from '../types';

type HostDetailsPageProps = {
  hostId?: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  user: User | null;
};

export function HostDetailsPage({ hostId, navigate, onLogout, user }: HostDetailsPageProps) {
  const [details, setDetails] = useState<HostDetails | null>(null);
  const [count, setCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'error'>('info');
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);

  async function loadDetails(id: string) {
    const payload = await getHostDetails(id);
    setDetails(payload);
  }

  useEffect(() => {
    if (!hostId) {
      setFeedbackType('error');
      setFeedback('O parametro id e obrigatorio na URL.');
      setLoading(false);
      return;
    }

    let active = true;

    getHostDetails(hostId)
      .then((payload) => {
        if (active) {
          setDetails(payload);
        }
      })
      .catch((error) => {
        setFeedbackType('error');
        setFeedback(error instanceof Error ? error.message : 'Erro ao carregar host.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [hostId]);

  async function handlePing() {
    if (!hostId || count < 1) {
      setFeedbackType('error');
      setFeedback('Informe um valor de count valido (maior que 0).');
      return;
    }

    setPinging(true);
    setFeedbackType('info');
    setFeedback('Executando ping...');

    try {
      const result = await pingHost(hostId, count);
      setFeedbackType(result.reachable ? 'success' : 'error');
      setFeedback(
        result.reachable
          ? `Ping realizado com sucesso em ${formatDate(result.checkedAt)}.`
          : `Host indisponivel em ${formatDate(result.checkedAt)}: ${result.error ?? '-'}`,
      );
      await loadDetails(hostId);
    } catch (error) {
      setFeedbackType('error');
      setFeedback(error instanceof Error ? error.message : 'Erro ao executar ping.');
    } finally {
      setPinging(false);
    }
  }

  const host = details?.host;
  const history = details?.history ?? [];

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setFeedback(''), 4200);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  return (
    <main className="page">
      <Navbar active="host" authenticated navigate={navigate} onLogout={onLogout} user={user} />
      <section className="content narrow">
        <header className="details-header">
          <p className="eyebrow">Detalhes do host</p>
          <h1>{loading ? 'Carregando...' : host?.name ?? 'Host invalido'}</h1>
          <p>{host ? `${host.address} - ${host.category}` : ''}</p>
        </header>

        {feedback ? (
          <div className={`toast ${feedbackType}`} role="status">
            {feedback}
            <button type="button" onClick={() => setFeedback('')} aria-label="Fechar notificacao">
              Fechar
            </button>
          </div>
        ) : null}

        <section className="stats-grid">
          <article>
            <span>Status atual</span>
            <strong>{host?.status ?? '-'}</strong>
          </article>
          <article>
            <span>Disponibilidade</span>
            <strong>{Number(host?.uptime ?? 0).toFixed(2)}%</strong>
          </article>
          <article>
            <span>Checks totais</span>
            <strong>{details?.statistics.totalChecks ?? '-'}</strong>
          </article>
          <article>
            <span>Ultimo check</span>
            <strong className="small-stat">{formatDate(details?.statistics.lastCheckAt)}</strong>
          </article>
        </section>

        <section className="panel">
          <h2>Verificacao de disponibilidade</h2>
          <p>Execute uma nova verificacao manual de ping para atualizar status e historico.</p>
          <div className="ping-controls">
            <label htmlFor="ping-count">Pacotes</label>
            <input
              id="ping-count"
              max={10}
              min={1}
              onChange={(event) => setCount(Number(event.target.value))}
              type="number"
              value={count}
            />
            <button className="primary-dark" disabled={pinging || !hostId} type="button" onClick={handlePing}>
              {pinging ? 'Verificando...' : 'Verificar disponibilidade'}
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Grafico de latencia e disponibilidade</h2>
          <p>Ultimos checks de latencia media em ms.</p>
          <LatencyChart history={history} />
        </section>

        <section className="panel">
          <h2>Timeline de checks de ping</h2>
          <p>Cada barra representa um check de ping.</p>
          <div className="legend">
            <span>
              <i className="dot green-dot" />
              Online
            </span>
            <span>
              <i className="dot red-dot" />
              Offline
            </span>
          </div>
          <TimelineChart history={history} />
        </section>

        <section className="panel">
          <h2>Historico de ping</h2>
          <p>Ultimas verificacoes de disponibilidade do host.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Transm.</th>
                  <th>Receb.</th>
                  <th>Media (ms)</th>
                  <th>Erro</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6}>Nenhum ping registrado ainda.</td>
                  </tr>
                ) : (
                  history.map((entry, index) => (
                    <tr key={`${entry.checkedAt}-${index}`}>
                      <td>{formatDate(entry.checkedAt)}</td>
                      <td>
                        <span className={entry.reachable ? 'status online' : 'status offline'}>
                          {entry.reachable ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>{entry.transmitted}</td>
                      <td>{entry.received}</td>
                      <td>{entry.avgMs === null ? '-' : Number(entry.avgMs).toFixed(3)}</td>
                      <td className="error-cell">{entry.error ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
