import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Header from './components/Header/Header';
import AuthProvider from './features/auth/AuthProvider';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Memories and login pull in API and dialog code, so load them only when visited.
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Suspense fallback={<p className="page-status">Loading…</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
