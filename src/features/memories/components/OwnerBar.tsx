import { useState } from 'react';
import { errorMessage } from '../../../lib/api';
import type { SiteSettings } from '../types';
import styles from './Memories.module.css';

interface OwnerBarProps {
  username: string;
  settings: SiteSettings | null;
  selecting: boolean;
  onToggleUploads: (enabled: boolean) => Promise<void>;
  onToggleSelect: () => void;
  onLogout: () => void;
}

export default function OwnerBar({
  username,
  settings,
  selecting,
  onToggleUploads,
  onToggleSelect,
  onLogout,
}: OwnerBarProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async (enabled: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await onToggleUploads(enabled);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.ownerBar} aria-label="Owner controls">
      <span className={styles.signedIn}>
        Signed in as <strong>{username}</strong>
      </span>

      <label className={styles.switch}>
        <input
          type="checkbox"
          role="switch"
          checked={settings?.uploadsEnabled ?? false}
          disabled={!settings || saving}
          onChange={(e) => void toggle(e.target.checked)}
        />
        <span>Guest uploads {settings?.uploadsEnabled ? 'on' : 'off'}</span>
      </label>

      {settings?.monthlyLimit !== undefined && (
        <span className={styles.usage} title="Uploads this calendar month (UTC)">
          {settings.monthlyUploads} / {settings.monthlyLimit} this month
        </span>
      )}

      <div className={styles.ownerActions}>
        <button type="button" className={styles.secondary} onClick={onToggleSelect} aria-pressed={selecting}>
          {selecting ? 'Done' : 'Select'}
        </button>
        <button type="button" className={styles.secondary} onClick={onLogout}>
          Log out
        </button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
