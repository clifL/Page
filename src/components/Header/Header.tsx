import { Link, NavLink } from 'react-router';
import styles from './Header.module.css';

const EXTERNAL_LINKS = [
  { label: 'Portfolio', href: 'https://gamejolt.com/games/go-ezoo/174179' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/clif' },
] as const;

export default function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.logo} to="/">
        Clif<span>.L</span>
      </Link>
      <nav aria-label="Main">
        <ul className={styles.nav}>
          <li>
            <NavLink
              to="/memories"
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
            >
              Memories
            </NavLink>
          </li>
          {EXTERNAL_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
