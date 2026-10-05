// Made by Jack (iamjustjack.de)
import { useEffect, useRef, useState, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cx, deg, len, reducedMotion, vars } from '../lib/util';
import type { PaperColor, Tone, TornEdge } from '../types';

export interface PaperProps extends HTMLAttributes<HTMLElement> {
  /** Fill colour of the sheet. "notebook" draws ruled lines with a margin. @default 'paper' */
  color?: PaperColor | 'notebook';
  /** Torn edge shape. @default 'big-1' */
  edge?: TornEdge;
  /** Rotation in degrees. @default 0 */
  tilt?: number;
  /** Drop the shadow, e.g. for sheets lying on other sheets. */
  flat?: boolean;
  /** Inner padding (number = px). Without it the CSS variable --pad applies (default 32px), so pages can change it per breakpoint. */
  pad?: number | string;
  /** Rendered element, e.g. 'section' or 'article'. @default 'div' */
  as?: ElementType;
}

/** A torn sheet of paper with a white rim - the core surface of Paper Pop. */
export function Paper({ color = 'paper', edge = 'big-1', tilt, flat, pad, as: Tag = 'div', className, style, ...rest }: PaperProps) {
  return (
    <Tag
      className={cx('pp-paper', `pp-bg-${color}`, `pp-t-${edge}`, flat && 'pp-flat', className)}
      style={{ ...vars({ '--r': deg(tilt), '--pad': len(pad) }), ...style }}
      {...rest}
    />
  );
}

export type WashiPattern = 'rainbow' | 'pink' | 'mint' | 'sky' | 'butter' | 'lilac' | 'dots' | 'stripes' | 'grid' | 'hearts';

export interface WashiProps extends HTMLAttributes<HTMLElement> {
  /** Tape length (number = px). @default 140 */
  width?: number | string;
  /** Rotation in degrees. @default -4 */
  tilt?: number;
  /** Print on the tape. @default 'rainbow' */
  pattern?: WashiPattern;
  /** Which torn ends to use. @default 'lr-1' */
  edge?: 'lr-1' | 'lr-2';
  /** Render in the text flow instead of absolutely positioned. */
  inline?: boolean;
}

/** A strip of washi tape. Position it with style={{ top, left }} on a relative parent. */
export function Washi({ width = 140, tilt = -4, pattern = 'rainbow', edge = 'lr-1', inline, className, style, ...rest }: WashiProps) {
  return (
    <i
      aria-hidden="true"
      className={cx('pp-washi', `pp-washi-${pattern}`, `pp-t-${edge}`, inline && 'pp-washi-inline', className)}
      style={{ ...vars({ '--w': len(width), '--r': deg(tilt) }), ...style }}
      {...rest}
    />
  );
}

export interface PolaroidProps extends HTMLAttributes<HTMLElement> {
  /** Image URL. Without it the photo area shows a striped placeholder (or `children`). */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Handwritten caption under the photo. */
  caption?: ReactNode;
  /** Frame width (number = px). Without it the frame uses the CSS variable --pw (default 300px). */
  width?: number | string;
  /** Rotation in degrees. @default 0 */
  tilt?: number;
  /** Stick a piece of washi tape on top: `true` for a centered strip, or Washi props to place it yourself. */
  tape?: boolean | WashiProps;
  /** Placeholder stripe colours. @default 'sky' */
  color?: PaperColor;
  /** Override the second (lighter) stripe colour, any CSS colour. */
  color2?: string;
  /** Small ink tag in the top right corner of the photo. */
  tag?: string;
  /** Photo aspect ratio. @default '1' */
  ratio?: string;
  /** Custom photo content (icon, big letter, anything). */
  children?: ReactNode;
}

/** Polaroid frame with a handwritten caption. Works with an image or any placeholder content. */
export function Polaroid({ src, alt = '', caption, width, tilt, tape, color = 'sky', color2, tag, ratio, children, className, style, ...rest }: PolaroidProps) {
  return (
    <figure
      className={cx('pp-polaroid', `pp-c-${color}`, className)}
      style={{ ...vars({ '--pw': len(width), '--r': deg(tilt), '--ratio': ratio, '--c2': color2 }), ...style }}
      {...rest}
    >
      {tape === true && <Washi width={120} tilt={-6} style={{ top: -14, left: '50%', marginLeft: -60 }} />}
      {tape && tape !== true && <Washi {...tape} />}
      <div className="pp-photo">
        {src ? <img src={src} alt={alt} loading="lazy" /> : children}
        {tag && <span className="pp-photo-tag">{tag}</span>}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export interface StickyNoteProps extends HTMLAttributes<HTMLDivElement> {
  /** Note colour. @default 'mint' */
  color?: PaperColor;
  /** Rotation in degrees. @default -3 */
  tilt?: number;
  /** Stick it on with a pushpin instead of tape. */
  pin?: boolean;
  /** Stick it on with washi tape. */
  tape?: boolean;
  /** Handwritten body text. */
  hand?: boolean;
  /** Curled bottom-right corner. */
  curl?: boolean;
}

/** A square-ish sticky note, optionally with a curled corner. */
export function StickyNote({ color = 'mint', tilt = -3, pin, tape, hand, curl, className, style, children, ...rest }: StickyNoteProps) {
  return (
    <div className={cx('pp-sticky', `pp-c-${color}`, hand && 'pp-hand', curl && 'pp-sticky-curl', className)} style={{ ...vars({ '--r': deg(tilt) }), ...style }} {...rest}>
      {pin && <span className="pp-pushpin" aria-hidden="true" />}
      {tape && <Washi width={110} tilt={3} style={{ top: -13, left: '50%', marginLeft: -55 }} />}
      {children}
    </div>
  );
}

export interface TodoListProps extends HTMLAttributes<HTMLUListElement> {
  /** Entries; `done` ones get a pink tick and are struck through. */
  items: Array<{ label: ReactNode; done?: boolean }>;
}

/** Static handwritten to-do list with drawn boxes - put it on a StickyNote. For an interactive list use Checklist. */
export function TodoList({ items, className, ...rest }: TodoListProps) {
  return (
    <ul className={cx('pp-todo', className)} {...rest}>
      {items.map((it, i) => <li key={i} className={it.done ? 'pp-todo-done' : undefined}>{it.label}</li>)}
    </ul>
  );
}

export type LabelTag = string | { label: string; color?: Tone; tilt?: number };

export interface LabelTagsProps extends HTMLAttributes<HTMLUListElement> {
  /** Tags as strings or objects with colour/tilt. Colours cycle through the palette by default. */
  items: LabelTag[];
  /** Tag size. @default 'md' */
  size?: 'sm' | 'md';
}

const CYCLE: Tone[] = ['pink', 'butter', 'mint', 'sky', 'lilac'];
const TILTS = [-2, 1.5, -1, 2, -1.5, 1];

/** Label-maker (Dymo) tags - great for skills, tools or categories. */
export function LabelTags({ items, size = 'md', className, ...rest }: LabelTagsProps) {
  return (
    <ul className={cx('pp-dymo', size === 'sm' && 'pp-dymo-sm', className)} {...rest}>
      {items.map((it, i) => {
        const t = typeof it === 'string' ? { label: it } : it;
        return (
          <li key={t.label} className={`pp-c-${t.color ?? CYCLE[i % CYCLE.length]}`} style={vars({ '--r': deg(t.tilt ?? TILTS[i % TILTS.length]) })}>
            {t.label}
          </li>
        );
      })}
    </ul>
  );
}

export interface StampProps extends HTMLAttributes<HTMLDivElement> {
  /** Stamp ink colour. @default 'butter' */
  color?: PaperColor;
  /** Rotation in degrees. @default -12 */
  tilt?: number;
  /** Small handwritten line under the stamp text. */
  note?: ReactNode;
  /** Controls visibility; toggling it to true plays the "thump" animation. @default true */
  show?: boolean;
  /** Center it absolutely over the parent (like a "sent!" overlay). */
  overlay?: boolean;
}

/** A rubber stamp that thumps onto the page - for success states and highlights. */
export function Stamp({ color = 'butter', tilt = -12, note, show = true, overlay, className, style, children, ...rest }: StampProps) {
  return (
    <div
      role="status"
      className={cx('pp-stamp', `pp-c-${color}`, show && 'pp-stamp-on', overlay && 'pp-stamp-overlay', className)}
      style={{ ...vars({ '--r': deg(tilt) }), ...style }}
      {...rest}
    >
      {show && (
        <>
          {children}
          {note && <small>{note}</small>}
        </>
      )}
    </div>
  );
}

export interface StickerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Sticker colour. @default 'butter' */
  color?: Tone;
  /** Outline shape. @default 'burst' */
  shape?: 'circle' | 'burst' | 'star';
  /** Diameter in px. @default 96 */
  size?: number;
  /** Rotation in degrees. @default 12 */
  tilt?: number;
  /** Spin slowly all the time instead of only on hover. */
  spin?: boolean;
}

/** A round "NEU!" style sticker that wiggles on hover. */
export function Sticker({ color = 'butter', shape = 'burst', size = 96, tilt = 12, spin, className, style, children, ...rest }: StickerProps) {
  return (
    <span
      className={cx('pp-sticker', `pp-sticker-${shape}`, `pp-c-${color}`, spin && 'pp-sticker-spin', className)}
      style={{ ...vars({ '--s': `${size}px`, '--r': deg(tilt), '--fs': typeof children === 'string' ? Math.min(0.2, 1.05 / Math.max(1, children.length)) : undefined }), ...style }}
      {...rest}
    >
      <span>{children}</span>
    </span>
  );
}

export interface MarkerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Highlight colour. @default 'butter' */
  color?: PaperColor;
  /** How the text is marked. @default 'highlight' */
  variant?: 'highlight' | 'underline' | 'circle' | 'washi' | 'strike';
  /** Draw the mark when it scrolls into view (instead of immediately). @default true */
  onView?: boolean;
}

/** Marks inline text with a highlighter swipe, a scribbled underline, a circle or washi tape. */
export function Marker({ color = 'butter', variant = 'highlight', onView = true, className, children, ...rest }: MarkerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(!onView);
  useEffect(() => {
    if (!onView || !ref.current || typeof IntersectionObserver === 'undefined') return setOn(true);
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setOn(true), { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [onView]);
  return (
    <span ref={ref} className={cx('pp-marker', `pp-marker-${variant}`, `pp-c-${color}`, on && 'pp-marker-on', className)} {...rest}>
      {children}
      {(variant === 'underline' || variant === 'circle') && (
        <svg className="pp-marker-svg" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
          <path
            pathLength={1}
            d={variant === 'underline' ? 'M2 14 C 20 9, 40 17, 60 12 S 90 10, 98 13' : 'M60 2 C 20 0, 2 6, 3 11 S 30 20, 60 18 S 99 13, 97 7 S 60 -1, 30 4'}
          />
        </svg>
      )}
    </span>
  );
}

const DOODLES = {
  arrow: { vb: '0 0 120 60', d: 'M4 40 C 30 10, 70 8, 108 26 M92 12 L 110 27 L 90 38' },
  'curly-arrow': { vb: '0 0 120 80', d: 'M6 70 C 20 20, 60 70, 58 40 S 30 10, 60 14 S 100 30, 110 50 M96 46 L 111 52 L 112 36' },
  circle: { vb: '0 0 120 70', d: 'M70 6 C 25 2, 4 18, 6 36 S 40 68, 76 64 S 118 44, 112 24 S 70 2, 40 10' },
  squiggle: { vb: '0 0 160 30', d: 'M4 16 C 14 4, 22 4, 30 16 S 46 28, 56 16 S 72 4, 82 16 S 98 28, 108 16 S 124 4, 134 16 S 150 28, 156 16' },
  underline: { vb: '0 0 160 20', d: 'M4 12 C 40 6, 90 16, 156 8 M20 17 C 60 13, 100 17, 140 14' },
  star: { vb: '0 0 60 60', d: 'M30 4 L 37 22 L 56 23 L 41 35 L 47 54 L 30 43 L 13 54 L 19 35 L 4 23 L 23 22 Z' },
  burst: { vb: '0 0 60 60', d: 'M30 4 V 16 M30 44 V 56 M4 30 H 16 M44 30 H 56 M12 12 L 20 20 M40 40 L 48 48 M48 12 L 40 20 M20 40 L 12 48' },
  heart: { vb: '0 0 60 56', d: 'M30 50 C 10 38, 2 26, 6 15 S 24 2, 30 14 C 36 2, 50 4, 54 15 S 50 38, 30 50 Z' },
  spiral: { vb: '0 0 60 60', d: 'M30 30 m 0 -2 a 2 2 0 1 1 -2 3 a 6 6 0 1 1 8 -6 a 11 11 0 1 1 -16 12 a 17 17 0 1 1 26 -18 a 23 23 0 1 1 -36 22' },
} as const;

export type DoodleKind = keyof typeof DOODLES;

export interface DoodleProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** What to scribble. */
  kind: DoodleKind;
  /** Stroke colour (any CSS colour). @default 'var(--pp-ink)' */
  color?: string;
  /** Width in px, height follows the doodle's aspect ratio. @default 120 */
  size?: number;
  /** Rotation in degrees. @default 0 */
  tilt?: number;
  /** Draw the line on mount. @default true */
  animate?: boolean;
}

/** Hand-drawn decorations: arrows, circles, squiggles, stars. Drawn in on mount. */
export function Doodle({ kind, color = 'var(--pp-ink)', size = 120, tilt, animate = true, className, style, ...rest }: DoodleProps) {
  const { vb, d } = DOODLES[kind];
  return (
    <span className={cx('pp-doodle', animate && 'pp-doodle-draw', className)} style={{ ...vars({ '--r': deg(tilt), '--dc': color }), width: size, ...style }} aria-hidden="true" {...rest}>
      <svg viewBox={vb}>
        <path d={d} pathLength={1} />
      </svg>
    </span>
  );
}

export interface CutlineProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional handwritten note at the end of the line. */
  label?: ReactNode;
  /** Cut once by itself when it scrolls into view. Clicking always cuts. */
  onView?: boolean;
}

/** A dashed "cut here" divider - click it and the scissors snip along the line. */
export function Cutline({ label, onView, className, onClick, ...rest }: CutlineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [busy, setBusy] = useState(false);
  const start = () => { if (!busy && !reducedMotion()) { setBusy(true); setRun((n) => n + 1); } };
  useEffect(() => {
    if (!onView || !ref.current || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { start(); io.disconnect(); } }, { threshold: 0.8 });
    io.observe(ref.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onView]);
  return (
    <div ref={ref} className={cx('pp-cutline', className)} role="separator" onClick={(e) => { onClick?.(e); start(); }} {...rest}>
      <span key={run} className={cx('pp-cutline-line', busy && 'pp-cutline-run')}>
        <svg className="pp-cutline-scissors" viewBox="0 0 24 24" width={40} height={40} aria-hidden="true" onAnimationEnd={(e) => e.animationName === 'pp-cut-go' && setBusy(false)}>
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <g className="pp-blade pp-blade-a"><circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12M14.47 14.48 20 20" /></g>
            <g className="pp-blade pp-blade-b"><circle cx="6" cy="18" r="3" /><path d="M20 4 8.12 15.88" /></g>
          </g>
        </svg>
      </span>
      {label && <span className="pp-hand">{label}</span>}
    </div>
  );
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level (h1-h4). @default 2 */
  level?: 1 | 2 | 3 | 4;
  /** Visual size, independent from the level. @default 'lg' */
  size?: 'xxl' | 'xl' | 'lg' | 'md' | 'sm';
  /** Colour of a trailing accent like the pink dot in "Jack.". */
  accent?: PaperColor;
}

/** Big, chunky display heading (Dela Gothic One). Wrap a word in <em> to colour it with `accent`. */
export function Heading({ level = 2, size = 'lg', accent = 'pink', className, style, ...rest }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cx('pp-heading', 'pp-display', `pp-heading-${size}`, className)} style={{ ...vars({ '--accent': `var(--pp-${accent})` }), ...style }} {...rest} />;
}

export interface KickerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Rotation in degrees. @default -2 */
  tilt?: number;
}

/** Handwritten line above a heading ("hi, schön dass du da bist"). */
export function Kicker({ tilt = -2, className, style, ...rest }: KickerProps) {
  return <span className={cx('pp-kicker', className)} style={{ ...vars({ '--r': deg(tilt) }), ...style }} {...rest} />;
}

export interface NotebookProps extends HTMLAttributes<HTMLDivElement> {
  /** Distance of the red margin line from the left (px). Default 70, 40 on small screens. */
  margin?: number;
  /** Line height of the ruling (px). Text snaps to it. @default 36 */
  line?: number;
  /** Torn edge. @default 'top-1' */
  edge?: TornEdge;
  /** Rotation in degrees. @default 0.6 */
  tilt?: number;
  /** Punch holes along the left edge. */
  holes?: boolean;
  /** Rendered element, e.g. 'article'. @default 'div' */
  as?: ElementType;
}

/** A ruled notebook page - long text, notes and articles sit on the lines. */
export function Notebook({ margin, line = 36, edge = 'top-1', tilt = 0.6, holes, as: Tag = 'div', className, style, ...rest }: NotebookProps) {
  return (
    <Tag
      className={cx('pp-paper', 'pp-notebook', `pp-t-${edge}`, holes && 'pp-notebook-holes', className)}
      style={{ ...vars({ '--margin': margin === undefined ? undefined : `${margin}px`, '--line': `${line}px`, '--r': deg(tilt) }), ...style }}
      {...rest}
    />
  );
}

