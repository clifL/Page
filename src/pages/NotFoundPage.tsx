import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <main className="page-status">
      <h1>Page not found</h1>
      <Link to="/" style={{ color: 'var(--highlight)' }}>Back home</Link>
    </main>
  );
}
