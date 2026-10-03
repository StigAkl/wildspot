import { useState } from 'react';
import { api } from '../api.js';

export default function LoginPage({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const credentials = Object.fromEntries(new FormData(event.currentTarget));
    setError('');
    setIsSubmitting(true);

    try {
      const { user } = isRegistering ? await api.register(credentials) : await api.login(credentials);
      onLogin(user);
    } catch (submitError) {
      setError(submitError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1 className="brand brand--large">⛺ Wildspot</h1>
        <p className="muted">Logg steder du har vært, og bygg opp et lager av gode teltplasser.</p>

        <div className="tabs">
          <button
            type="button"
            className={isRegistering ? 'tab' : 'tab is-active'}
            onClick={() => setIsRegistering(false)}
          >
            Logg inn
          </button>
          <button
            type="button"
            className={isRegistering ? 'tab is-active' : 'tab'}
            onClick={() => setIsRegistering(true)}
          >
            Ny bruker
          </button>
        </div>

        {isRegistering && (
          <label>
            Brukernavn
            <input name="username" autoComplete="username" required minLength={2} maxLength={40} />
          </label>
        )}
        <label>
          E-post
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Passord
          <input
            name="password"
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            minLength={isRegistering ? 8 : undefined}
            required
          />
        </label>

        <p className="error" role="alert">
          {error}
        </p>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isRegistering ? 'Opprett bruker' : 'Logg inn'}
        </button>
      </form>
    </main>
  );
}
