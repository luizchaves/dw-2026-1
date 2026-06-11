import { FormEvent, useState } from 'react';

import { Navbar } from '../components/Navbar';
import { register } from '../lib/api';
import { setSession } from '../lib/session';

type RegisterPageProps = {
  navigate: (path: string) => void;
  onAuthenticated: () => void;
};

export function RegisterPage({ navigate, onAuthenticated }: RegisterPageProps) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const session = await register({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
        passwordConfirmation: String(form.get('passwordConfirmation') ?? ''),
      });
      setSession(session);
      onAuthenticated();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel cadastrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <Navbar active="register" navigate={navigate} />
      <section className="auth-layout">
        <div>
          <h1>Cadastro</h1>
          <p>Crie sua conta para acessar o dashboard de monitoramento e gerenciar hosts.</p>
        </div>
        <form className="auth-panel" onSubmit={handleSubmit}>
          <label>
            <span>Nome</span>
            <input autoComplete="name" name="name" required type="text" />
          </label>
          <label>
            <span>Email</span>
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            <span>Senha</span>
            <input autoComplete="new-password" minLength={6} name="password" required type="password" />
          </label>
          <label>
            <span>Confirmacao de senha</span>
            <input
              autoComplete="new-password"
              minLength={6}
              name="passwordConfirmation"
              required
              type="password"
            />
          </label>
          <p className="form-feedback">{feedback}</p>
          <button className="primary-dark" disabled={submitting} type="submit">
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
          <p className="form-link">
            Ja tem conta?{' '}
            <button type="button" onClick={() => navigate('/login')}>
              Entrar
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
