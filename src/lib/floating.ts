// Made by Jack (iamjustjack.de)
import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

const GAP = 8;
const EDGE = 8;

/**
 * Fixed position for a dropdown portaled to <body>, so cards with transforms or overflow can't clip it.
 * Opens below the anchor, flips up when there is more room above, stays inside the viewport and follows scroll/resize.
 */
export function useFloating(anchor: RefObject<HTMLElement | null>, open: boolean, { align = 'left', matchWidth = false, maxHeight = 320 }: { align?: 'left' | 'right'; matchWidth?: boolean; maxHeight?: number } = {}) {
  const [pos, setPos] = useState<{ style: CSSProperties; up: boolean }>({ style: { position: 'fixed', top: 0, left: 0, opacity: 0 }, up: false });

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      if (!r) return;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const below = vh - r.bottom - GAP - EDGE;
      const above = r.top - GAP - EDGE;
      const up = below < Math.min(maxHeight, 200) && above > below;
      const style: CSSProperties = {
        position: 'fixed',
        maxHeight: Math.max(120, Math.min(maxHeight, up ? above : below)),
        overflowY: 'auto',
        ...(up ? { bottom: vh - r.top + GAP } : { top: r.bottom + GAP }),
        ...(matchWidth && { width: r.width }),
        ...(align === 'right' ? { right: Math.max(EDGE, vw - r.right) } : { left: Math.max(EDGE, Math.min(r.left, vw - EDGE - (matchWidth ? r.width : 210))) }),
        maxWidth: vw - 2 * EDGE,
      };
      setPos({ style, up });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [anchor, open, align, matchWidth, maxHeight]);

  return pos;
}
