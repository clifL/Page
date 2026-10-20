import { useCallback, useEffect, useState } from 'react';
import { useSwipe } from '../../hooks/useSwipe';
import styles from './Carousel.module.css';

export interface Slide {
  src: string;
  alt: string;
}

interface CarouselProps {
  slides: readonly Slide[];
  intervalMs?: number;
}

export default function Carousel({ slides, intervalMs = 6000 }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  const { offset, dragging, handlers } = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });

  // Autoplay. Restarts whenever the slide changes, so manual navigation resets the timer.
  useEffect(() => {
    if (dragging || count < 2) return;
    let timer = window.setInterval(next, intervalMs);
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(next, intervalMs);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [index, dragging, count, intervalMs, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev]);

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label="Featured photos">
      <div
        className={styles.track}
        data-dragging={dragging || undefined}
        style={{ transform: `translate3d(calc(${-index * 100}% + ${offset}px), 0, 0)` }}
        {...handlers}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
          >
            <img
              className={i === index ? `${styles.image} ${styles.active}` : styles.image}
              src={slide.src}
              alt={slide.alt}
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
          </div>
        ))}
      </div>

      <button className={`${styles.btn} ${styles.prev}`} onClick={prev} aria-label="Previous photo">
        &#10094;
      </button>
      <button className={`${styles.btn} ${styles.next}`} onClick={next} aria-label="Next photo">
        &#10095;
      </button>

      <div className={styles.dots}>
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            className={i === index ? styles.dotActive : undefined}
            onClick={() => setIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </section>
  );
}
