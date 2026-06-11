import { FormEvent, useState } from 'react';

import { Navbar } from '../components/Navbar';
import { login } from '../lib/api';
import { setSession } from '../lib/session';

type LoginPageProps = {
  navigate: (path: string) => void;
  onAuthenticated: () => void;
};

export function LoginPage({ navigate, onAuthenticated }: LoginPageProps) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const session = await login({
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      });
      setSession(session);
      onAuthenticated();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel entrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <Navbar active="login" navigate={navigate} />
      <section className="auth-layout">
        <div>
          <h1>Entrar</h1>
          <p>
            Acesse seu dashboard para consultar hosts, executar checks e acompanhar o historico de
            disponibilidade.
          </p>
        </div>
        <form className="auth-panel" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            <span>Senha</span>
            <input autoComplete="current-password" name="password" required type="password" />
          </label>
          <p className="form-feedback">{feedback}</p>
          <button className="primary-dark" disabled={submitting} type="submit">
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="form-link">
            Ainda nao tem conta?{' '}
            <button type="button" onClick={() => navigate('/register')}>
              Cadastre-se
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
