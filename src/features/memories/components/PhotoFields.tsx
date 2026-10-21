import { PRIVATE_TAG } from '../photoApi';
import type { PhotoMeta } from '../types';
import styles from './Memories.module.css';

interface PhotoFieldsProps {
  defaults?: PhotoMeta;
  existingTags: string[];
  titleRequired?: boolean;
  titlePlaceholder?: string;
  /** Upload: blank falls back to each file's date. Edit: a date is required. */
  dateHint?: string;
}

/** Title, description, tags and the private switch, shared by upload and edit. */
/** Today as YYYY-MM-DD in local time; the latest allowed 'date taken'. */
const today = () => new Date().toLocaleDateString('en-CA');

export default function PhotoFields({
  defaults,
  existingTags,
  titleRequired,
  titlePlaceholder,
  dateHint,
}: PhotoFieldsProps) {
  const otherTags = defaults?.tags.filter((t) => t !== PRIVATE_TAG) ?? [];
  return (
    <>
      <label className={styles.field}>
        <span>Title</span>
        <input
          name="title"
          type="text"
          maxLength={100}
          required={titleRequired}
          defaultValue={defaults?.title}
          placeholder={titlePlaceholder}
        />
      </label>

      <label className={styles.field}>
        <span>Description</span>
        <textarea name="description" rows={3} maxLength={1000} defaultValue={defaults?.description} />
      </label>

      <label className={styles.field}>
        <span>Date taken</span>
        <input name="takenAt" type="date" max={today()} required={!dateHint} defaultValue={defaults?.takenAt} />
        {dateHint && <small>{dateHint}</small>}
      </label>

      <label className={styles.field}>
        <span>Tags</span>
        <input
          name="tags"
          type="text"
          list="tag-suggestions"
          placeholder="e.g. travel, family"
          autoComplete="off"
          defaultValue={otherTags.join(', ')}
        />
        <datalist id="tag-suggestions">
          {existingTags
            .filter((t) => t !== PRIVATE_TAG)
            .map((t) => (
              <option key={t} value={t} />
            ))}
        </datalist>
        <small>Separate tags with commas.</small>
      </label>

      <label className={styles.checkbox}>
        <input name="private" type="checkbox" defaultChecked={defaults?.tags.includes(PRIVATE_TAG)} />
        <span>
          Private <small>Only visible when logged in</small>
        </span>
      </label>
    </>
  );
}
