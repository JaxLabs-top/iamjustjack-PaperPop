// Made by Jack (iamjustjack.de)
import { useEffect, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx, deg, reducedMotion, vars } from '../lib/util';
import type { PaperColor, TornEdge } from '../types';
import { Cutline } from './foundations';
import { Icon, type IconName } from './Icon';

export interface NavLink {
  label: ReactNode;
  href: string;
  /** Marks the current page. */
  active?: boolean;
  icon?: IconName;
}

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** Brand text ("jack"). A pink dot is added after it. */
  brand: ReactNode;
  /** Brand link. @default '/' */
  brandHref?: string;
  /** Navigation pills. */
  links?: NavLink[];
  /** Extra content on the right (buttons, avatar). */
  actions?: ReactNode;
  /** Stick to the top while scrolling. */
  sticky?: boolean;
  /** Fold the links into a menu button on phones. With false the pills just wrap. @default true */
  collapse?: boolean;
  /** Sub-page mode: a back pill on the left, the brand moves to the right. */
  back?: { label: ReactNode; href: string };
}

/** Top bar with the brand and pill links (menu button on phones), or a back pill on sub-pages. */
export function Navbar({ brand, brandHref = '/', links = [], actions, sticky, collapse = true, back, className, ...rest }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const brandEl = <a className="pp-navbar-brand" href={brandHref}>{brand}<span>.</span></a>;
  if (back) {
    return (
      <header className={cx('pp-navbar', sticky && 'pp-navbar-sticky', className)} {...rest}>
        <a className="pp-pill" href={back.href}>{back.label}</a>
        {brandEl}
      </header>
    );
  }
  return (
    <header className={cx('pp-navbar', sticky && 'pp-navbar-sticky', collapse && 'pp-navbar-collapse', open && 'pp-navbar-open', className)} {...rest}>
      {brandEl}
      {collapse && (
        <button type="button" className="pp-navbar-toggle pp-iconbtn pp-iconbtn-sm" aria-expanded={open} aria-label="Menü" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'x' : 'menu'} size={18} />
        </button>
      )}
      <nav aria-label="Hauptnavigation">
        {links.map((l) => (
          <a key={l.href} href={l.href} className={cx('pp-pill', l.active && 'pp-pill-on')} aria-current={l.active ? 'page' : undefined} onClick={() => setOpen(false)}>
            {l.icon && <Icon name={l.icon} size={16} />}{l.label}
          </a>
        ))}
        {actions}
      </nav>
    </header>
  );
}

export interface FooterLink {
  label: ReactNode;
  /** Link target; without it the entry renders as a button (e.g. "Cookie-Einstellungen"). */
  href?: string;
  onClick?: () => void;
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Big brand word on the left. */
  brand: ReactNode;
  /** Text line (copyright etc.). */
  note?: ReactNode;
  /** Small links (Impressum, Datenschutz …); entries without href become buttons. */
  links?: FooterLink[];
  /** Right side, e.g. "nach oben ↑". */
  aside?: ReactNode;
  /** Sheet colour. @default 'lilac' */
  color?: PaperColor;
  /** Draw a scissors cut line above the footer. @default true */
  cutline?: boolean;
}

/** Torn footer strip with brand, note and small legal links. */
export function Footer({ brand, note, links = [], aside, color = 'lilac', cutline = true, className, ...rest }: FooterProps) {
  return (
    <>
      {cutline && <Cutline onView className="pp-container pp-footer-cut" aria-hidden="true" />}
      <footer className={cx('pp-paper', 'pp-t-foot-2', `pp-bg-${color}`, 'pp-footer', className)} {...rest}>
        <div className="pp-footer-inner">
          <div className="pp-display pp-footer-brand">{brand}<span>.</span></div>
          <div>
            {note && <p>{note}</p>}
            {links.length > 0 && (
              <nav className="pp-footer-links" aria-label="Rechtliches">
                {links.map((l, i) => l.href
                  ? <a key={i} href={l.href} onClick={l.onClick}>{l.label}</a>
                  : <button key={i} type="button" onClick={l.onClick}>{l.label}</button>)}
              </nav>
            )}
          </div>
          {aside && <div className="pp-footer-aside">{aside}</div>}
        </div>
      </footer>
    </>
  );
}

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  icon?: IconName;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Tabs with content. */
  items: TabItem[];
  /** Active tab id (controlled). Leave undefined for uncontrolled. */
  value?: string;
  /** Called with the new tab id. */
  onChange?: (id: string) => void;
  /** Folder tab colours cycle through the palette. @default true */
  colorful?: boolean;
}

const TAB_COLORS: PaperColor[] = ['pink', 'butter', 'mint', 'sky', 'lilac'];

/** Folder-style index tabs sticking out of a paper sheet. Arrow keys switch tabs. */
export function Tabs({ items, value, onChange, colorful = true, className, ...rest }: TabsProps) {
  const [own, setOwn] = useState(items[0]?.id);
  const active = value ?? own;
  const base = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const select = (id: string) => {
    if (value === undefined) setOwn(id);
    onChange?.(id);
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const n = (i + d + items.length) % items.length;
    refs.current[n]?.focus();
    select(items[n]!.id);
  };
  const current = items.find((t) => t.id === active) ?? items[0];
  const idx = items.indexOf(current!);
  return (
    <div className={cx('pp-tabs', className)} {...rest}>
      <div role="tablist" className="pp-tablist">
        {items.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            type="button"
            id={`${base}-t-${t.id}`}
            aria-selected={t.id === current?.id}
            aria-controls={`${base}-p`}
            tabIndex={t.id === current?.id ? 0 : -1}
            className={cx('pp-tab', colorful && `pp-c-${TAB_COLORS[i % TAB_COLORS.length]}`)}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.icon && <Icon name={t.icon} size={16} />}{t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-p`} aria-labelledby={`${base}-t-${current?.id}`} className={cx('pp-tabpanel', colorful && `pp-c-${TAB_COLORS[idx % TAB_COLORS.length]}`)}>
        {current?.content}
      </div>
    </div>
  );
}

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Sections. */
  items: AccordionItem[];
  /** Allow several open sections. */
  multiple?: boolean;
  /** Initially open ids. */
  defaultOpen?: string[];
}

/** Folding paper strips - great for FAQs. */
export function Accordion({ items, multiple, defaultOpen = [], className, ...rest }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const base = useId();
  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]));
  return (
    <div className={cx('pp-accordion', className)} {...rest}>
      {items.map((it, i) => {
        const on = open.includes(it.id);
        return (
          <div key={it.id} className={cx('pp-acc-item', on && 'pp-acc-open')} style={vars({ '--r': deg(i % 2 ? 0.4 : -0.4) })}>
            <h3>
              <button type="button" aria-expanded={on} aria-controls={`${base}-${it.id}`} onClick={() => toggle(it.id)}>
                <span>{it.title}</span>
                <span className="pp-acc-icon" aria-hidden="true"><Icon name="plus" size={18} stroke={3} /></span>
              </button>
            </h3>
            <div id={`${base}-${it.id}`} className="pp-acc-panel" role="region" hidden={!on}>
              <div>{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  /** Path items; the last one is the current page. */
  items: Array<{ label: ReactNode; href?: string }>;
}

/** Where am I? Handwritten arrows between the crumbs. */
export function Breadcrumbs({ items, className, ...rest }: BreadcrumbsProps) {
  return (
    <nav aria-label="Brotkrumen" className={cx('pp-crumbs', className)} {...rest}>
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {it.href && i < items.length - 1 ? <a href={it.href}>{it.label}</a> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  pages: number;
  /** Called with the new page. */
  onChange: (page: number) => void;
}

function pageList(page: number, pages: number): Array<number | '…'> {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1]! > 1) out.push('…');
    out.push(p);
  });
  return out;
}

/** Page numbers as little paper squares, with prev/next arrows. */
export function Pagination({ page, pages, onChange, className, ...rest }: PaginationProps) {
  return (
    <nav aria-label="Seiten" className={cx('pp-pages', className)} {...rest}>
      <button type="button" aria-label="Vorherige Seite" disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon name="chevron-left" size={18} stroke={3} /></button>
      {pageList(page, pages).map((p, i) =>
        p === '…' ? <span key={`e${i}`} className="pp-pages-gap">…</span> : (
          <button key={p} type="button" aria-current={p === page ? 'page' : undefined} className={p === page ? 'on' : undefined} onClick={() => onChange(p)}>{p}</button>
        ),
      )}
      <button type="button" aria-label="Nächste Seite" disabled={page >= pages} onClick={() => onChange(page + 1)}><Icon name="chevron-right" size={18} stroke={3} /></button>
    </nav>
  );
}

export interface SidebarSection {
  title?: ReactNode;
  links: Array<NavLink & { badge?: ReactNode }>;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Brand at the top. */
  brand?: ReactNode;
  /** Link groups. */
  sections: SidebarSection[];
  /** Content pinned to the bottom (user, logout). */
  footer?: ReactNode;
}

/** Vertical app navigation for dashboards and tools. */
export function Sidebar({ brand, sections, footer, className, ...rest }: SidebarProps) {
  return (
    <aside className={cx('pp-sidebar', className)} {...rest}>
      {brand && <div className="pp-sidebar-brand pp-display">{brand}<span>.</span></div>}
      <nav>
        {sections.map((s, i) => (
          <div key={i} className="pp-sidebar-section">
            {s.title && <b className="pp-caps">{s.title}</b>}
            {s.links.map((l) => (
              <a key={l.href} href={l.href} className={cx(l.active && 'on')} aria-current={l.active ? 'page' : undefined}>
                {l.icon && <Icon name={l.icon} size={19} />}
                <span>{l.label}</span>
                {l.badge !== undefined && <span className="pp-badge pp-c-pink">{l.badge}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      {footer && <div className="pp-sidebar-footer">{footer}</div>}
    </aside>
  );
}

export interface MenuItem {
  label: ReactNode;
  icon?: IconName;
  onSelect?: () => void;
  href?: string;
  danger?: boolean;
  /** Draws a divider above this item. */
  divider?: boolean;
}

export interface MenuProps {
  /** Content of the trigger button. */
  trigger: ReactNode;
  /** Accessible label for icon-only triggers. */
  label?: string;
  /** Entries. */
  items: MenuItem[];
  /** Which edge the menu aligns to. @default 'left' */
  align?: 'left' | 'right';
  /** Render the trigger as a round icon button. */
  iconTrigger?: boolean;
  className?: string;
}

/** Dropdown menu on a small paper card. Closes on outside click and Escape; fully usable with the keyboard (arrows, Home/End, type-ahead). */
export function Menu({ trigger, label, items, align = 'left', iconTrigger, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const rows = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? []);
  const close = (refocus = false) => { setOpen(false); if (refocus) btn.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  const from = useRef<'first' | 'last'>('first');
  useEffect(() => {
    if (!open) return;
    const r = rows();
    (from.current === 'last' ? r[r.length - 1] : r[0])?.focus();
  }, [open]);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); from.current = e.key === 'ArrowUp' ? 'last' : 'first'; setOpen(true); }
  };
  const onListKey = (e: React.KeyboardEvent) => {
    const r = rows();
    const i = r.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => { e.preventDefault(); r[(n + r.length) % r.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(r.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === 'Tab') close();
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typed.current;
      const now = Date.now();
      t.text = now - t.at > 700 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
      t.at = now;
      const order = r.map((_, k) => (i + (t.text.length > 1 ? 0 : 1) + k + r.length) % r.length);
      const hit = order.find((k) => r[k]?.textContent?.trim().toLowerCase().startsWith(t.text));
      if (hit !== undefined) go(hit);
    }
  };
  return (
    <div ref={ref} className={cx('pp-menu', `pp-menu-${align}`, open && 'pp-menu-open', className)}>
      <button ref={btn} type="button" className={iconTrigger ? 'pp-iconbtn pp-iconbtn-sm pp-c-paper' : 'pp-pill'} aria-haspopup="menu" aria-expanded={open} aria-label={label} onKeyDown={onTriggerKey} onClick={() => { from.current = 'first'; setOpen((o) => !o); }}>
        {trigger}
        {!iconTrigger && <Icon name="chevron-down" size={16} stroke={3} />}
      </button>
      {open && (
        <div role="menu" className="pp-menu-list" onKeyDown={onListKey}>
          {items.map((it, i) => {
            const body = <>{it.icon && <Icon name={it.icon} size={17} />}<span>{it.label}</span></>;
            const cls = cx('pp-menu-item', it.danger && 'pp-menu-danger', it.divider && 'pp-menu-divider');
            const pick = () => { it.onSelect?.(); close(true); };
            return it.href
              ? <a key={i} role="menuitem" href={it.href} className={cls} onClick={pick}>{body}</a>
              : <button key={i} role="menuitem" type="button" className={cls} onClick={pick}>{body}</button>;
          })}
        </div>
      )}
    </div>
  );
}

export interface StepsProps extends HTMLAttributes<HTMLOListElement> {
  /** Steps with a handwritten title and text; colour, edge and tilt vary automatically unless set. */
  items: Array<{ title: ReactNode; text?: ReactNode; color?: PaperColor; edge?: TornEdge; tilt?: number }>;
  /** Columns on wide screens. @default 4 */
  columns?: number;
  /** Torn edge for each card. @default 'card-1' */
  edge?: TornEdge;
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Numbered paper cards in a row - "how it works" sections. The cards fly in one after another when they scroll into view. */
export function Steps({ items, columns = 4, edge, className, style, ...rest }: StepsProps) {
  const edges: TornEdge[] = ['card-1', 'card-2', 'card-3', 'card-4'];
  const colors: PaperColor[] = ['butter', 'mint', 'sky', 'pink', 'lilac'];
  const ref = useRef<HTMLOListElement>(null);
  const [phase, setPhase] = useState<'idle' | 'wait' | 'in'>('idle');
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || typeof IntersectionObserver === 'undefined') return;
    setPhase('wait');
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setPhase('in'); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <ol ref={ref} className={cx('pp-steps', phase !== 'idle' && `pp-steps-${phase}`, className)} style={{ ...vars({ '--cols': columns }), ...style }} {...rest}>
      {items.map((s, i) => (
        <li key={i} className={cx('pp-paper', `pp-t-${s.edge ?? edge ?? edges[i % edges.length]}`, `pp-bg-${s.color ?? colors[i % colors.length]}`)} style={vars({ '--r': deg(s.tilt ?? [-1.5, 1, -0.8, 1.6][i % 4]), '--i': i, '--fx': i % 2 ? '40px' : '-40px' })}>
          <strong>{s.title}</strong>
          {s.text && <span>{s.text}</span>}
        </li>
      ))}
    </ol>
  );
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  /** Entries, newest first or oldest first - your call. */
  items: Array<{ date: ReactNode; title: ReactNode; text?: ReactNode; color?: PaperColor; icon?: IconName }>;
}

/** Vertical timeline with a dashed line and pastel dots. */
export function Timeline({ items, className, ...rest }: TimelineProps) {
  const colors: PaperColor[] = ['pink', 'butter', 'mint', 'sky', 'lilac'];
  return (
    <ol className={cx('pp-timeline', className)} {...rest}>
      {items.map((it, i) => (
        <li key={i}>
          <span className={cx('pp-timeline-dot', `pp-c-${it.color ?? colors[i % colors.length]}`)}>{it.icon && <Icon name={it.icon} size={15} stroke={2.6} />}</span>
          <span className="pp-timeline-date pp-hand">{it.date}</span>
          <b>{it.title}</b>
          {it.text && <p>{it.text}</p>}
        </li>
      ))}
    </ol>
  );
}
