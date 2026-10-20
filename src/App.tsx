import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Memories pulls in upload/IndexedDB code, so load it only when visited.
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'));

export default function App() {
  return (
    <>
      <Header />
      <Suspense fallback={<p className="page-status">Loading…</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
