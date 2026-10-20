import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';

interface SwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Fraction of the element width that counts as a swipe. */
  threshold?: number;
}

/** Ignore tiny movements so taps and clicks still work. */
const DRAG_START_PX = 6;
/** A quick flick counts as a swipe even if it is short. */
const FLICK_VELOCITY = 0.5; // px per ms

/**
 * Horizontal drag/swipe using Pointer Events, so it works for touch, mouse and pen.
 * Pair with `touch-action: pan-y` on the element so vertical page scrolling still works.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 0.18 }: SwipeOptions) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; time: number; id: number } | null>(null);
  const dragged = useRef(false);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    start.current = { x: e.clientX, time: performance.now(), id: e.pointerId };
    dragged.current = false;
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    const dx = e.clientX - start.current.x;
    if (!dragging && Math.abs(dx) < DRAG_START_PX) return;
    if (!dragging) {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragged.current = true;
      setDragging(true);
    }
    setOffset(dx);
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    const dx = e.clientX - start.current.x;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.current.time);
    const width = e.currentTarget.clientWidth || 1;
    start.current = null;
    if (dragging && (Math.abs(dx) > width * threshold || velocity > FLICK_VELOCITY)) {
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    }
    setDragging(false);
    setOffset(0);
  };

  const onPointerCancel = () => {
    start.current = null;
    setDragging(false);
    setOffset(0);
  };

  // The click that follows a drag shouldn't also count as a tap.
  const onClickCapture = (e: MouseEvent<HTMLElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.stopPropagation();
    e.preventDefault();
  };

  return {
    offset,
    dragging,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture },
  };
}
