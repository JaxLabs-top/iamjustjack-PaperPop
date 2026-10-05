// Made by Jack (iamjustjack.de)
import type { CSSProperties } from 'react';

/** Joins truthy class names. */
export function cx(...parts: unknown[]): string {
  return parts.filter((p): p is string => typeof p === 'string' && p !== '').join(' ');
}

/** Typed helper for CSS custom properties: vars({ '--r': '2deg' }). Undefined values are dropped. */
export function vars(v: Record<string, string | number | undefined>): CSSProperties {
  const out: Record<string, string | number> = {};
  for (const [k, val] of Object.entries(v)) if (val !== undefined) out[k] = val;
  return out as CSSProperties;
}

/** Numbers become px, strings pass through. */
export const len = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v);

/** Rotation helper: number -> "Ndeg". */
export const deg = (v: number | undefined) => (v === undefined ? undefined : `${v}deg`);

/** True when the user asked for less motion. Safe during SSR. */
export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let uid = 0;
/** Tiny stable-ish id for label/aria wiring when React's useId isn't wanted. */
export const nextId = (prefix = 'pp') => `${prefix}-${++uid}`;
