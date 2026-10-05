// Made by Jack (iamjustjack.de)
import { useEffect, useRef } from 'react';
import { reducedMotion } from '../lib/util';

const COLORS = ['#FF6FB1', '#FFE27A', '#A6EBCB', '#9CCBFF', '#C3A6FF'];
const SVG = 'http://www.w3.org/2000/svg';
const SPARKLE = 'M12 1c.6 5.6 2.2 9.3 11 11-8.8 1.7-10.4 5.4-11 11-.6-5.6-2.2-9.3-11-11 8.8-1.7 10.4-5.4 11-11z';

/** Bursts `count` little sparkles at a viewport position. */
export function burstSparkles(x: number, y: number, count = 6) {
  if (reducedMotion()) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.classList.add('pp-spark');
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', SPARKLE);
    p.setAttribute('fill', COLORS[i % COLORS.length]!);
    s.appendChild(p);
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const d = 30 + Math.random() * 30;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * d}px`);
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
}

/** Sparkles follow every click/tap on the page. Returns an uninstall function. */
export function installSparkles() {
  if (reducedMotion()) return () => {};
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    burstSparkles(e.clientX, e.clientY);
  };
  document.addEventListener('pointerdown', onDown);
  return () => document.removeEventListener('pointerdown', onDown);
}

const DESKTOP = '(hover: hover) and (pointer: fine)';
const MAX_RECTS = 1500;
const EDGES = ['pp-t-lr-1', 'pp-t-lr-2'];
type Line = { left: number; right: number; top: number; bottom: number };

function selectedTextRects(range: Range): DOMRect[] {
  const rects: DOMRect[] = [];
  const root = range.commonAncestorContainer;
  const walker = document.createTreeWalker(root.nodeType === Node.TEXT_NODE ? root.parentNode! : root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node && rects.length < MAX_RECTS; node = walker.nextNode()) {
    if (!range.intersectsNode(node) || !node.textContent?.trim()) continue;
    const part = document.createRange();
    part.selectNodeContents(node);
    if (node === range.startContainer) part.setStart(node, range.startOffset);
    if (node === range.endContainer) part.setEnd(node, range.endOffset);
    for (const r of part.getClientRects()) if (r.width > 1 && r.height > 4) rects.push(r);
  }
  return rects;
}

function toLines(rects: DOMRect[]): Line[] {
  const lines: Line[] = [];
  for (const r of rects) {
    const mid = (r.top + r.bottom) / 2;
    const line = lines.find((l) => mid > l.top && mid < l.bottom && r.left - l.right < 24 && l.left - r.right < 24);
    if (line) {
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
      line.top = Math.min(line.top, r.top);
      line.bottom = Math.max(line.bottom, r.bottom);
    } else lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
  }
  return lines;
}

/** Selected text is covered with washi tape (desktop only). Returns an uninstall function. */
export function installWashiSelection() {
  if (!window.matchMedia(DESKTOP).matches) return () => {};
  const root = document.documentElement;
  root.classList.add('pp-washi-select');
  const layer = document.createElement('div');
  layer.className = 'pp-washi-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  let frame = 0;
  const draw = () => {
    frame = 0;
    layer.replaceChildren();
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;
    const active = document.activeElement;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
    const rects: DOMRect[] = [];
    for (let i = 0; i < selection.rangeCount; i++) rects.push(...selectedTextRects(selection.getRangeAt(i)));
    toLines(rects).forEach((line, i) => {
      const strip = document.createElement('i');
      strip.className = `pp-washi-mark ${EDGES[i % EDGES.length]}`;
      strip.style.left = `${line.left + window.scrollX - 3}px`;
      strip.style.top = `${line.top + window.scrollY - 1}px`;
      strip.style.width = `${line.right - line.left + 6}px`;
      strip.style.height = `${line.bottom - line.top + 2}px`;
      strip.style.setProperty('--r', `${i % 2 ? 0.5 : -0.4}deg`);
      layer.appendChild(strip);
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  document.addEventListener('selectionchange', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', schedule, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('selectionchange', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('scroll', schedule);
    layer.remove();
    root.classList.remove('pp-washi-select');
  };
}

/**
 * Paper Pop renders plain `<a href>` links (Navbar, Footer, Sidebar, SocialLinks …). Call this once with your
 * router's navigate function and clicks on same-origin paths (`/…`) become client-side navigation.
 * `#anchors`, `mailto:`, external links, new-tab clicks and `target`/`download` links are left alone.
 *
 *   const navigate = useNavigate();
 *   useEffect(() => installLinkInterceptor(navigate), [navigate]);
 */
export function installLinkInterceptor(navigate: (path: string) => void) {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a');
    if (!a || a.target || a.hasAttribute('download') || a.origin !== window.location.origin) return;
    const href = a.getAttribute('href') ?? '';
    if (!href.startsWith('/') || href.startsWith('//')) return;
    e.preventDefault();
    navigate(href);
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}

/** Throws paper confetti from a viewport position. */
export function burstConfetti(x: number, y: number, count = 28) {
  if (reducedMotion()) return;
  for (let i = 0; i < count; i++) {
    const c = document.createElement('i');
    c.className = 'pp-confetti-bit';
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const v = 90 + Math.random() * 140;
    c.style.left = `${x}px`;
    c.style.top = `${y}px`;
    c.style.background = COLORS[i % COLORS.length]!;
    c.style.setProperty('--dx', `${Math.cos(a) * v}px`);
    c.style.setProperty('--dy', `${Math.sin(a) * v}px`);
    c.style.setProperty('--rot', `${(Math.random() - 0.5) * 900}deg`);
    c.style.animationDelay = `${Math.random() * 80}ms`;
    document.body.appendChild(c);
    c.addEventListener('animationend', () => c.remove());
  }
}

export interface PaperPopEffectsProps {
  /** Sparkles on every click. @default true */
  sparkles?: boolean;
  /** Washi tape text selection on desktop. @default true */
  washiSelection?: boolean;
}

/** Mount once at the app root to switch on the Paper Pop page effects. Renders nothing. */
export function PaperPopEffects({ sparkles = true, washiSelection = true }: PaperPopEffectsProps) {
  useEffect(() => (sparkles ? installSparkles() : undefined), [sparkles]);
  useEffect(() => (washiSelection ? installWashiSelection() : undefined), [washiSelection]);
  return null;
}

export interface TitleTypewriterOptions {
  /** Milliseconds per deleted character. @default 22 */
  deleteSpeed?: number;
  /** Milliseconds per typed character. @default 42 */
  typeSpeed?: number;
  /** Block shown at the end while the title moves. Empty string for none. @default '▌' */
  cursor?: string;
  /** Milliseconds the title must stay unchanged before typing starts, so quick successive changes only animate the last one. @default 150 */
  settle?: number;
}

/**
 * Types the browser tab title instead of swapping it: whenever `document.title` changes, the old one is
 * deleted back to the shared beginning and the new one is typed. Returns an uninstall function.
 *
 * The whole <head> is observed, not the <title> element - frameworks like Next replace the element on
 * navigation, so an observer on the element itself would never fire.
 */
export function installTitleTypewriter({ deleteSpeed = 22, typeSpeed = 42, cursor = '▌', settle = 150 }: TitleTypewriterOptions = {}) {
  if (typeof document === 'undefined' || reducedMotion()) return () => {};
  let target = document.title;
  let shown = document.title;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let wait: ReturnType<typeof setTimeout> | null = null;

  const put = (text: string, withCursor: boolean) => {
    shown = text;
    document.title = withCursor ? text + cursor : text;
    obs.takeRecords();
  };
  const shared = (a: string, b: string) => {
    const max = Math.min(a.length, b.length);
    let i = 0;
    while (i < max && a[i] === b[i]) i++;
    return i;
  };

  const tick = () => {
    timer = null;
    if (shown === target) { put(target, false); return; }
    const keep = shared(shown, target);
    const back = shown.length > keep;
    const rest = back ? shown.length - keep : target.length - shown.length;
    const speed = (back ? deleteSpeed : typeSpeed) * (rest > 30 ? 0.4 : 1);
    put(back ? shown.slice(0, -1) : target.slice(0, shown.length + 1), true);
    timer = setTimeout(tick, speed);
  };

  const obs = new MutationObserver(() => {
    target = document.title;
    if (document.hidden) {
      if (timer) { clearTimeout(timer); timer = null; }
      if (wait) { clearTimeout(wait); wait = null; }
      put(target, false);
      return;
    }
    if (timer) { put(shown, true); return; }
    put(shown, false);
    if (wait) clearTimeout(wait);
    wait = setTimeout(() => { wait = null; tick(); }, settle);
  });
  obs.observe(document.head, { childList: true, characterData: true, subtree: true });

  return () => {
    obs.disconnect();
    if (timer) clearTimeout(timer);
    if (wait) clearTimeout(wait);
    if (document.title !== target) document.title = target;
  };
}

export interface TitleTypewriterProps extends TitleTypewriterOptions {
  /** Sets the tab title (and types it). Leave out to animate titles set elsewhere, e.g. by a framework's metadata. */
  title?: string;
}

/** Mount once at the app root: every change of the tab title is typed out. Renders nothing. */
export function TitleTypewriter({ title, deleteSpeed, typeSpeed, cursor, settle }: TitleTypewriterProps) {
  useEffect(() => installTitleTypewriter({ deleteSpeed, typeSpeed, cursor, settle }), [deleteSpeed, typeSpeed, cursor, settle]);
  useEffect(() => { if (title !== undefined) document.title = title; }, [title]);
  return null;
}

export interface ConfettiProps {
  /** Change this value (e.g. increment a counter) to fire another burst. 0 never fires. */
  fire: number;
  /** Pieces per burst. @default 28 */
  count?: number;
}

/** Fires paper confetti from the centre of this element whenever `fire` changes. */
export function Confetti({ fire, count = 28 }: ConfettiProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!fire || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    burstConfetti(r.left + r.width / 2, r.top + r.height / 2, count);
  }, [fire, count]);
  return <span ref={ref} className="pp-confetti-anchor" aria-hidden="true" />;
}
