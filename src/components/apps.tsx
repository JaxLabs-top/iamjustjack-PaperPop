// Made by Jack (iamjustjack.de)
import { useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { detectLanguage, normalizeLanguage, tokenize, toLines } from '../lib/highlight';
import { cx, deg, vars } from '../lib/util';
import type { PaperColor, Tone } from '../types';
import { CopyButton } from './buttons';
import { Avatar } from './dashboard';
import { Icon } from './Icon';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Left navigation, usually a <Sidebar>. Hidden behind a menu button on small screens. */
  sidebar: ReactNode;
  /** Top bar content (title, search, avatar). */
  topbar?: ReactNode;
  /** Page content. */
  children: ReactNode;
}

/** Dashboard/app frame: sidebar on the left, top bar and scrolling content on the right. */
export function AppShell({ sidebar, topbar, children, className, ...rest }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cx('pp-shell', open && 'pp-shell-open', className)} {...rest}>
      <div className="pp-shell-side">{sidebar}</div>
      {open && <div className="pp-shell-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className="pp-shell-main">
        <div className="pp-shell-top">
          <button type="button" className="pp-iconbtn pp-iconbtn-sm pp-c-paper pp-shell-menu" aria-label="Navigation" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'x' : 'menu'} size={18} />
          </button>
          {topbar}
        </div>
        <main className="pp-shell-content">{children}</main>
      </div>
    </div>
  );
}

export interface ChatMessage {
  id: string | number;
  author: string;
  text: ReactNode;
  time?: ReactNode;
  /** Messages from the current user sit on the right. */
  own?: boolean;
}

export interface ChatBubbleProps extends HTMLAttributes<HTMLDivElement> {
  message: ChatMessage;
  /** Hide avatar and name (for consecutive messages). */
  compact?: boolean;
}

/** A single chat message; own messages are pink and on the right. */
export function ChatBubble({ message: m, compact, className, ...rest }: ChatBubbleProps) {
  return (
    <div className={cx('pp-chat-msg', m.own && 'pp-chat-own', compact && 'pp-chat-compact', className)} {...rest}>
      {!compact ? <Avatar name={m.author} size="sm" /> : <span className="pp-chat-spacer" />}
      <div className="pp-chat-bubble">
        {!compact && !m.own && <b>{m.author}</b>}
        <div>{m.text}</div>
        {m.time && <time>{m.time}</time>}
      </div>
    </div>
  );
}

export interface ChatThreadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /** Messages, oldest first. */
  messages: ChatMessage[];
  /** Called when the user sends a message. Omit to hide the input. */
  onSend?: (text: string) => void;
  /** Shows "… tippt" at the bottom. */
  typing?: string;
  /** Height of the scroll area. @default 380 */
  height?: number;
}

/** Scrolling chat with grouped bubbles, typing indicator and an input row. */
export function ChatThread({ messages, onSend, typing, height = 380, className, ...rest }: ChatThreadProps) {
  const [text, setText] = useState('');
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typing]);
  return (
    <div className={cx('pp-chat', className)} {...rest}>
      <div ref={list} className="pp-chat-list" style={{ height }} role="log" aria-live="polite">
        {messages.map((m, i) => <ChatBubble key={m.id} message={m} compact={messages[i - 1]?.author === m.author} />)}
        {typing && (
          <div className="pp-chat-typing"><span /><span /><span /><em className="pp-hand">{typing} tippt …</em></div>
        )}
      </div>
      {onSend && (
        <form className="pp-chat-input" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text.trim()); setText(''); } }}>
          <input className="pp-input pp-input-box" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nachricht …" aria-label="Nachricht" />
          <button type="submit" className="pp-iconbtn pp-c-pink" aria-label="Senden" disabled={!text.trim()}><Icon name="send" size={19} /></button>
        </form>
      )}
    </div>
  );
}

export interface KanbanCard { id: string; title: ReactNode; tag?: { label: string; color?: Tone }; assignee?: string; due?: ReactNode }
export interface KanbanColumn { id: string; title: ReactNode; color?: PaperColor; cards: KanbanCard[] }

export interface KanbanBoardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Columns with cards. */
  columns: KanbanColumn[];
  /** Called with the updated columns after a card was dragged to another column. */
  onChange?: (columns: KanbanColumn[]) => void;
}

/** Drag-and-drop board of sticky notes in columns. */
export function KanbanBoard({ columns, onChange, className, ...rest }: KanbanBoardProps) {
  const [cols, setCols] = useState(columns);
  const [over, setOver] = useState<string | null>(null);
  useEffect(() => setCols(columns), [columns]);
  function move(cardId: string, to: string) {
    const card = cols.flatMap((c) => c.cards).find((c) => c.id === cardId);
    if (!card) return;
    const next = cols.map((c) => ({ ...c, cards: c.id === to ? [...c.cards.filter((x) => x.id !== cardId), card] : c.cards.filter((x) => x.id !== cardId) }));
    setCols(next);
    onChange?.(next);
  }
  return (
    <div className={cx('pp-kanban', className)} {...rest}>
      {cols.map((col, ci) => (
        <section key={col.id} className={cx('pp-kanban-col', over === col.id && 'pp-kanban-over')}
          onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => { setOver(null); move(e.dataTransfer.getData('text/plain'), col.id); }}>
          <header><span className={cx('pp-kanban-dot', `pp-c-${col.color ?? (['pink', 'butter', 'mint', 'sky'] as const)[ci % 4]}`)} /><b>{col.title}</b><span className="pp-badge pp-c-paper">{col.cards.length}</span></header>
          <div className="pp-kanban-cards">
            {col.cards.map((c, i) => (
              <article key={c.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                className={cx('pp-kanban-card', `pp-c-${col.color ?? (['pink', 'butter', 'mint', 'sky'] as const)[ci % 4]}`)} style={vars({ '--r': deg([-1.2, 0.8, -0.4, 1.4][i % 4]) })}>
                {c.tag && <span className={cx('pp-tag', `pp-c-${c.tag.color ?? 'paper'}`)}>{c.tag.label}</span>}
                <p>{c.title}</p>
                {(c.assignee || c.due) && (
                  <footer>{c.due && <span><Icon name="clock" size={13} />{c.due}</span>}{c.assignee && <Avatar name={c.assignee} size={26} />}</footer>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export interface MiniCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Selected date. */
  value?: Date;
  /** Called with the clicked date. */
  onChange?: (date: Date) => void;
  /** Dates with a dot (events). */
  marked?: Date[];
  /** Month shown initially. @default value or today */
  month?: Date;
}

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

/** Month calendar on a tear-off pad: pick a date, see marked days. Click the month name to jump to any month and year. Weeks start on Monday. */
export function MiniCalendar({ value, onChange, marked = [], month, className, ...rest }: MiniCalendarProps) {
  const [view, setView] = useState(() => { const d = month ?? value ?? new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [picking, setPicking] = useState(false);
  const [year, setYear] = useState<string | null>(null);
  const days = useMemo(() => {
    const first = (view.getDay() + 6) % 7;
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    return [...Array<null>(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))];
  }, [view]);
  const today = new Date();
  const shift = (n: number) => setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));
  const setY = (y: number) => setView((v) => new Date(Math.min(9999, Math.max(1, y)), v.getMonth(), 1));
  const commitYear = () => { const n = Number(year); if (year !== null && Number.isInteger(n) && n > 0) setY(n); setYear(null); };
  return (
    <div className={cx('pp-cal', className)} onKeyDown={(e) => { if (e.key === 'Escape' && picking) { e.stopPropagation(); setPicking(false); } }} {...rest}>
      <div className="pp-cal-rings" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div>
      {picking ? (
        <div key="months" className="pp-cal-pick">
          <header>
            <button type="button" aria-label="Vorheriges Jahr" onClick={() => setY(view.getFullYear() - 1)}><Icon name="chevron-left" size={18} stroke={3} /></button>
            <input
              className="pp-cal-year pp-display" inputMode="numeric" aria-label="Jahr" value={year ?? String(view.getFullYear())}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => /^\d{0,4}$/.test(e.target.value) && setYear(e.target.value)}
              onBlur={commitYear}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { commitYear(); e.currentTarget.blur(); }
                else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setYear(null); setY(view.getFullYear() + (e.key === 'ArrowUp' ? 1 : -1)); }
              }}
              onWheel={(e) => { setYear(null); setY(view.getFullYear() + (e.deltaY < 0 ? 1 : -1)); }}
            />
            <button type="button" aria-label="Nächstes Jahr" onClick={() => setY(view.getFullYear() + 1)}><Icon name="chevron-right" size={18} stroke={3} /></button>
          </header>
          <div className="pp-cal-months" role="grid" onWheel={(e) => setY(view.getFullYear() + (e.deltaY < 0 ? 1 : -1))}>
            {MONTHS.map((m, i) => (
              <button
                key={m} type="button" style={{ '--i': i } as React.CSSProperties}
                className={cx(i === view.getMonth() && 'on', i === today.getMonth() && view.getFullYear() === today.getFullYear() && 'today')}
                onClick={() => { setView(new Date(view.getFullYear(), i, 1)); setPicking(false); }}
              >{m}</button>
            ))}
          </div>
        </div>
      ) : (
        <div key="days" className="pp-cal-days">
          <header>
            <button type="button" aria-label="Vorheriger Monat" onClick={() => shift(-1)}><Icon name="chevron-left" size={18} stroke={3} /></button>
            <button type="button" className="pp-cal-title pp-display" aria-label="Monat und Jahr wählen" aria-expanded={false} onClick={() => setPicking(true)}>
              {view.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              <Icon name="chevron-down" size={14} stroke={3} />
            </button>
            <button type="button" aria-label="Nächster Monat" onClick={() => shift(1)}><Icon name="chevron-right" size={18} stroke={3} /></button>
          </header>
          <div className="pp-cal-grid" role="grid">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => <span key={d} className="pp-cal-dow">{d}</span>)}
            {days.map((d, i) =>
              d ? (
                <button key={i} type="button" onClick={() => onChange?.(d)}
                  className={cx(value && sameDay(d, value) && 'on', sameDay(d, today) && 'today', marked.some((m) => sameDay(m, d)) && 'marked')}
                  aria-label={d.toLocaleDateString('de-DE', { dateStyle: 'full' })} aria-pressed={value ? sameDay(d, value) : false}>
                  {d.getDate()}
                </button>
              ) : <span key={i} />,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface ChecklistItem { id: string; label: ReactNode; done?: boolean }

export interface ChecklistProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'title'> {
  /** Items. */
  items: ChecklistItem[];
  /** Called with the updated items. */
  onChange?: (items: ChecklistItem[]) => void;
  /** Title in marker font. */
  title?: ReactNode;
  /** Note colour. @default 'mint' */
  color?: PaperColor;
  /** Allow adding new items. */
  addable?: boolean;
  /** Rotation in degrees. @default 2 */
  tilt?: number;
}

/** To-do list on a sticky note - tick items off with a pink check. */
export function Checklist({ items, onChange, title, color = 'mint', addable, tilt = 2, className, style, ...rest }: ChecklistProps) {
  const [list, setList] = useState(items);
  const [draft, setDraft] = useState('');
  const update = (next: ChecklistItem[]) => { setList(next); onChange?.(next); };
  const done = list.filter((i) => i.done).length;
  return (
    <div className={cx('pp-sticky', `pp-c-${color}`, 'pp-checklist', className)} style={{ ...vars({ '--r': deg(tilt) }), ...style }} {...rest}>
      {title && <h3 className="pp-hand">{title} <small>{done}/{list.length}</small></h3>}
      <ul>
        {list.map((it) => (
          <li key={it.id} className={it.done ? 'done' : undefined}>
            <label className="pp-check">
              <input type="checkbox" checked={!!it.done} onChange={() => update(list.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))} />
              <span className="pp-check-box" aria-hidden="true"><svg viewBox="0 0 30 30"><path d="M5 15 L12 23 L27 3" pathLength={1} /></svg></span>
              <span className="pp-check-label pp-hand">{it.label}</span>
            </label>
          </li>
        ))}
      </ul>
      {addable && (
        <form onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { update([...list, { id: `${Date.now()}`, label: draft.trim() }]); setDraft(''); } }}>
          <input className="pp-input pp-input-line pp-hand" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="+ noch was …" aria-label="Neuer Punkt" />
        </form>
      )}
    </div>
  );
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Keys, e.g. ['⌘', 'K']. Strings render a single key. */
  keys: string | string[];
}

/** Keyboard key caps for shortcuts. */
export function Kbd({ keys, className, ...rest }: KbdProps) {
  const list = Array.isArray(keys) ? keys : [keys];
  return (
    <span className={cx('pp-kbds', className)} {...rest}>
      {list.map((k, i) => <kbd key={i} className="pp-kbd">{k}</kbd>)}
    </span>
  );
}

export type CodeTheme = 'ink' | 'paper' | 'pink' | 'butter' | 'mint' | 'sky' | 'lilac' | 'auto';
export type CodeLanguage = 'auto' | 'js' | 'ts' | 'tsx' | 'jsx' | 'json' | 'html' | 'xml' | 'css' | 'scss' | 'bash' | 'sh' | 'python' | 'go' | 'rust' | 'java' | 'kotlin' | 'swift' | 'csharp' | 'c' | 'cpp' | 'php' | 'ruby' | 'sql' | 'yaml' | 'toml' | 'markdown' | 'diff' | 'dockerfile' | 'text' | (string & {});

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** The code. */
  code: string;
  /** Label in the tab (file name or language). Defaults to the language. */
  title?: string;
  /** Show a copy button. @default true */
  copy?: boolean;
  /** Show line numbers. */
  lineNumbers?: boolean;
  /** Language for highlighting. "auto" detects it from the code; common names and aliases (ts, tsx, sh, yml, c++ ...) work. @default 'auto' */
  language?: CodeLanguage;
  /** Colour style. "ink" is dark, the pastels are light, "auto" follows the system light/dark setting. @default 'ink' */
  theme?: CodeTheme;
}

/** Code snippet with a file tab, copy button, automatic language detection and 20 languages highlighted in 8 colour styles. */
export function CodeBlock({ code, title, copy = true, lineNumbers, language = 'auto', theme = 'ink', className, ...rest }: CodeBlockProps) {
  const text = code.replace(/\n$/, '');
  const requested = normalizeLanguage(language);
  const lang = useMemo(() => (requested === 'auto' ? detectLanguage(text) : requested), [requested, text]);
  const lines = useMemo(() => toLines(tokenize(text, lang)), [text, lang]);
  return (
    <div className={cx('pp-code', `pp-code-t-${theme}`, className)} data-lang={lang} {...rest}>
      <div className="pp-code-bar">
        <span className="pp-code-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="pp-code-title">{title ?? (lang === 'text' ? '' : lang)}</span>
        {title && lang !== 'text' && <span className="pp-code-lang">{lang}</span>}
        {copy && <CopyButton text={code} className="pp-pill-sm" />}
      </div>
      <pre><code>{lines.map((line, i) => (
        <span key={i} className={cx('pp-code-line', line.length === 1 && line[0]!.t && (line[0]!.t === 'ins' || line[0]!.t === 'del') && `pp-tk-line-${line[0]!.t}`)}>
          {lineNumbers && <em>{i + 1}</em>}
          {line.map((tk, j) => (tk.t ? <span key={j} className={`pp-tk-${tk.t}`}>{tk.v}</span> : tk.v))}
          {'\n'}
        </span>
      ))}</code></pre>
    </div>
  );
}

export interface DrawerProps {
  /** Visible or not. */
  open: boolean;
  /** Called on backdrop click, Escape or the close button. */
  onClose: () => void;
  /** Heading. */
  title: ReactNode;
  /** Content. */
  children?: ReactNode;
  /** Side. @default 'right' */
  side?: 'left' | 'right';
  /** Width in px. @default 380 */
  width?: number;
}

/** A sheet of paper sliding in from the side - filters, details, settings. */
export function Drawer({ open, onClose, title, children, side = 'right', width = 380 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className={cx('pp-drawer-wrap', `pp-drawer-${side}`)}>
      <div className="pp-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="pp-drawer" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} style={{ width: `min(${width}px, 92vw)` }}>
        <header>
          <h2 className="pp-display">{title}</h2>
          <button type="button" className="pp-modal-close" aria-label="Schließen" onClick={onClose}><Icon name="x" size={18} stroke={3} /></button>
        </header>
        <div className="pp-drawer-body">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
