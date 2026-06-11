import { FormEvent, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { HostCard } from '../components/HostCard';
import { Navbar } from '../components/Navbar';
import { createHost, deleteHost, listHosts } from '../lib/api';
import type { Host, User } from '../types';

type DashboardPageProps = {
  navigate: (path: string) => void;
  onLogout: () => void;
  user: User | null;
};

export function DashboardPage({ navigate, onLogout, user }: DashboardPageProps) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    listHosts()
      .then((payload) => {
        if (active) {
          setHosts(payload);
        }
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Erro ao buscar hosts.'))
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback('');

    const form = new FormData(event.currentTarget);

    try {
      const created = await createHost({
        name: String(form.get('name') ?? ''),
        address: String(form.get('address') ?? ''),
        category: String(form.get('category') ?? ''),
      });
      setHosts((current) => [created, ...current]);
      event.currentTarget.reset();
      setModalOpen(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao adicionar host.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setFeedback('');

    try {
      await deleteHost(id);
      setHosts((current) => current.filter((host) => host.id !== id));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao excluir host.');
    }
  }

  return (
    <main className="page">
      <Navbar active="dashboard" authenticated navigate={navigate} onLogout={onLogout} user={user} />
      <section className="content">
        <header className="center-header">
          <p className="eyebrow">Painel de Hosts</p>
          <h1>Hosts disponiveis</h1>
          <p>Visualize informacoes basicas dos hosts.</p>
        </header>

        <div className="toolbar">
          <button className="primary-dark inline-icon" type="button" onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Adicionar novo host
          </button>
        </div>

        {feedback ? <p className="page-feedback">{feedback}</p> : null}

        {loading ? <p className="empty-state">Carregando hosts...</p> : null}

        {!loading && hosts.length === 0 ? <p className="empty-state">Nenhum host cadastrado ainda.</p> : null}

        <section className="host-grid">
          {hosts.map((host) => (
            <HostCard host={host} key={host.id} navigate={navigate} onDelete={handleDelete} />
          ))}
        </section>
      </section>

      {modalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={() => setModalOpen(false)}>
          <form className="modal-panel" onMouseDown={(event) => event.stopPropagation()} onSubmit={handleCreate}>
            <div className="modal-header">
              <div>
                <h2>Adicionar novo host</h2>
                <p>Preencha os dados para cadastrar um host no painel.</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setModalOpen(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <label>
              <span>Nome do host</span>
              <input name="name" placeholder="Google DNS" required type="text" />
            </label>
            <label>
              <span>Endereco (IP ou dominio)</span>
              <input name="address" placeholder="8.8.8.8" required type="text" />
            </label>
            <label>
              <span>Categoria</span>
              <input name="category" placeholder="DNS" required type="text" />
            </label>
            <button className="primary-dark" disabled={submitting} type="submit">
              {submitting ? 'Adicionando...' : 'Adicionar host'}
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
