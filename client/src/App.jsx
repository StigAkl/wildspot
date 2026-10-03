import { lazy, Suspense, useEffect, useState } from 'react';
import { api } from './api.js';
import LoginPage from './pages/LoginPage.jsx';

const MapPage = lazy(() => import('./pages/MapPage.jsx'));

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    api
      .getCurrentUser()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null));
  }, []);

  const isCheckingLogin = user === undefined;
  if (isCheckingLogin) return null;

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <Suspense fallback={<p className="loading">Laster kartet …</p>}>
      <MapPage user={user} onLogout={() => setUser(null)} />
    </Suspense>
  );
}
