// Made by Jack (iamjustjack.de)
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx, deg, vars } from '../lib/util';
import type { PaperColor, Tone } from '../types';
import { Avatar } from './dashboard';
import { Icon, type IconName } from './Icon';

export interface VoteButtonsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Score before the user's own vote. */
  score: number;
  /** The user's vote (controlled). Leave undefined to let the component manage it. */
  vote?: -1 | 0 | 1;
  /** Called with the new vote. */
  onVote?: (vote: -1 | 0 | 1) => void;
  /** Horizontal layout. */
  horizontal?: boolean;
}

/** Up/down voting column with a bouncy score. */
export function VoteButtons({ score, vote, onVote, horizontal, className, ...rest }: VoteButtonsProps) {
  const [own, setOwn] = useState<-1 | 0 | 1>(0);
  const v = vote ?? own;
  const set = (n: -1 | 1) => {
    const next = v === n ? 0 : n;
    if (vote === undefined) setOwn(next);
    onVote?.(next);
  };
  const total = score + (vote === undefined ? v : 0);
  return (
    <div className={cx('pp-votes', horizontal && 'pp-votes-h', className)} {...rest}>
      <button type="button" aria-label="Upvote" aria-pressed={v === 1} className={v === 1 ? 'on-up' : undefined} onClick={() => set(1)}><Icon name="arrow-up" size={18} stroke={3} /></button>
      <b key={total} className="pp-display">{total}</b>
      <button type="button" aria-label="Downvote" aria-pressed={v === -1} className={v === -1 ? 'on-down' : undefined} onClick={() => set(-1)}><Icon name="arrow-down" size={18} stroke={3} /></button>
    </div>
  );
}

export interface Reaction { icon: IconName; count: number; label: string; active?: boolean }

export interface ReactionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onToggle'> {
  /** Reactions with counts. */
  items: Reaction[];
  /** Called with the toggled reaction label and new state. */
  onToggle?: (label: string, active: boolean) => void;
}

/** Toggleable reaction chips (heart, fire, sparkle …) with counts. */
export function Reactions({ items, onToggle, className, ...rest }: ReactionsProps) {
  const [state, setState] = useState(() => Object.fromEntries(items.map((r) => [r.label, !!r.active])));
  return (
    <div className={cx('pp-reactions', className)} {...rest}>
      {items.map((r) => {
        const on = state[r.label]!;
        const count = r.count + (on && !r.active ? 1 : !on && r.active ? -1 : 0);
        return (
          <button key={r.label} type="button" aria-pressed={on} aria-label={`${r.label} (${count})`} className={on ? 'on' : undefined}
            onClick={() => { setState((s) => ({ ...s, [r.label]: !on })); onToggle?.(r.label, !on); }}>
            <Icon name={r.icon} size={16} stroke={2.6} />{count}
          </button>
        );
      })}
    </div>
  );
}

export interface ThreadCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Thread title. */
  title: ReactNode;
  /** Link to the thread. */
  href?: string;
  /** Author name. */
  author: string;
  /** Relative time ("vor 2 Std."). */
  time: ReactNode;
  /** Short preview of the first post. */
  excerpt?: ReactNode;
  /** Category chip. */
  category?: { label: string; color?: Tone };
  /** Tags under the excerpt. */
  tags?: string[];
  /** Reply count. */
  replies?: number;
  /** View count. */
  views?: number;
  /** Vote score - shows a vote column when set. */
  score?: number;
  /** Pinned threads get a pushpin. */
  pinned?: boolean;
  /** Marked solved/answered. */
  solved?: boolean;
  /** People who replied (avatars). */
  participants?: string[];
}

/** A forum thread in a list: votes, title, excerpt, category, tags and counters. */
export function ThreadCard({ title, href, author, time, excerpt, category, tags, replies, views, score, pinned, solved, participants, className, ...rest }: ThreadCardProps) {
  const T = href ? 'a' : 'span';
  return (
    <article className={cx('pp-thread', pinned && 'pp-thread-pinned', className)} {...rest}>
      {pinned && <span className="pp-pushpin" aria-label="Angepinnt" />}
      {score !== undefined && <VoteButtons score={score} />}
      <div className="pp-thread-main">
        <div className="pp-thread-meta">
          {category && <span className={cx('pp-tag', `pp-c-${category.color ?? 'sky'}`)}>{category.label}</span>}
          {solved && <span className="pp-tag pp-c-mint"><Icon name="check" size={12} stroke={3.4} />gelöst</span>}
          <span className="pp-soft"><b>{author}</b> · {time}</span>
        </div>
        <h3 className="pp-thread-title"><T href={href}>{title}</T></h3>
        {excerpt && <p className="pp-thread-excerpt">{excerpt}</p>}
        {tags && <div className="pp-thread-tags">{tags.map((t) => <span key={t}>#{t}</span>)}</div>}
      </div>
      <div className="pp-thread-side">
        {participants && (
          <div className="pp-avatars">{participants.slice(0, 3).map((p) => <Avatar key={p} name={p} size="sm" />)}</div>
        )}
        <div className="pp-thread-counts">
          {replies !== undefined && <span title="Antworten"><Icon name="chat" size={16} />{replies}</span>}
          {views !== undefined && <span title="Aufrufe"><Icon name="eye" size={16} />{views}</span>}
        </div>
      </div>
    </article>
  );
}

export interface PostProps extends HTMLAttributes<HTMLElement> {
  /** Author name. */
  author: string;
  /** Author avatar URL. */
  avatar?: string;
  /** Role badge ("Admin", "Mod", "OP"). */
  role?: string;
  /** Relative time. */
  time: ReactNode;
  /** Post body. */
  children: ReactNode;
  /** Reactions row. */
  reactions?: Reaction[];
  /** Buttons in the footer (Antworten, Melden …). */
  actions?: ReactNode;
  /** Highlight as accepted answer. */
  accepted?: boolean;
}

/** A full forum post with author header, body, reactions and actions. */
export function Post({ author, avatar, role, time, children, reactions, actions, accepted, className, ...rest }: PostProps) {
  return (
    <article className={cx('pp-post', accepted && 'pp-post-accepted', className)} {...rest}>
      {accepted && <span className="pp-post-accepted-tag pp-hand"><Icon name="check" size={16} stroke={3.4} />beste Antwort</span>}
      <header className="pp-post-head">
        <Avatar name={author} src={avatar} status="online" />
        <div><b>{author}</b>{role && <span className="pp-badge pp-c-lilac">{role}</span>}<small>{time}</small></div>
      </header>
      <div className="pp-post-body">{children}</div>
      {(reactions || actions) && (
        <footer className="pp-post-foot">
          {reactions && <Reactions items={reactions} />}
          {actions && <div className="pp-post-actions">{actions}</div>}
        </footer>
      )}
    </article>
  );
}

export interface CommentProps extends HTMLAttributes<HTMLDivElement> {
  /** Author name. */
  author: string;
  /** Relative time. */
  time: ReactNode;
  /** Comment text. */
  text: ReactNode;
  /** Like count. */
  likes?: number;
  /** Nested replies (more <Comment>s). */
  children?: ReactNode;
  /** Called when "Antworten" is clicked. */
  onReply?: () => void;
  /** Mark comments by the thread author. */
  op?: boolean;
}

/** Threaded comment with a dashed reply line; nest Comments as children. */
export function Comment({ author, time, text, likes, children, onReply, op, className, ...rest }: CommentProps) {
  return (
    <div className={cx('pp-comment', className)} {...rest}>
      <Avatar name={author} size="sm" />
      <div className="pp-comment-main">
        <div className="pp-comment-bubble">
          <div className="pp-comment-head"><b>{author}</b>{op && <span className="pp-badge pp-c-butter">OP</span>}<small>{time}</small></div>
          <p>{text}</p>
        </div>
        <div className="pp-comment-actions">
          {likes !== undefined && <span><Icon name="heart" size={13} />{likes}</span>}
          {onReply && <button type="button" onClick={onReply}>Antworten</button>}
        </div>
        {children && <div className="pp-comment-replies">{children}</div>}
      </div>
    </div>
  );
}

export interface ComposerProps extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Called with the text. The box clears afterwards. */
  onSubmit: (text: string) => void | Promise<void>;
  /** Placeholder. @default 'Schreib was Nettes …' */
  placeholder?: string;
  /** Submit label. @default 'Senden' */
  submitLabel?: ReactNode;
  /** Your name for the avatar. */
  user?: string;
  /** Max characters. @default 2000 */
  maxLength?: number;
}

const MD = /(`[^`\n]+`)|(\*\*[^*\n]+?\*\*)|(\*[^*\n]+?\*|_[^_\n]+?_)|(\[[^\]\n]*\]\([^)\n]*\))/;
const SAFE_URL = /^(https?:\/\/|mailto:|\/|#)/i;

function renderMd(src: string, live: boolean, key = ''): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = src;
  let n = 0;
  const mark = (t: string) => (live ? <span key={`${key}m${n++}`} className="pp-md-mark">{t}</span> : null);
  for (let m = MD.exec(rest); m; m = MD.exec(rest)) {
    if (m.index) out.push(rest.slice(0, m.index));
    const k = `${key}${n++}`;
    const t = m[0];
    if (m[1]) out.push(<span key={k}>{mark('`')}<code className="pp-md-code">{t.slice(1, -1)}</code>{mark('`')}</span>);
    else if (m[2]) out.push(<span key={k} className="pp-md-b">{mark('**')}{renderMd(t.slice(2, -2), live, `${k}.`)}{mark('**')}</span>);
    else if (m[3]) out.push(<span key={k} className="pp-md-i">{mark(t[0]!)}{renderMd(t.slice(1, -1), live, `${k}.`)}{mark(t[0]!)}</span>);
    else {
      const [, label = '', url = ''] = /^\[([^\]]*)\]\(([^)]*)\)$/.exec(t) ?? [];
      out.push(live
        ? <span key={k}>{mark('[')}<span className="pp-md-link">{renderMd(label, live, `${k}.`)}</span>{mark(`](${url})`)}</span>
        : SAFE_URL.test(url) ? <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="pp-md-link">{renderMd(label, live, `${k}.`)}</a> : <span key={k}>{label}</span>);
    }
    rest = rest.slice(m.index + t.length);
  }
  if (rest) out.push(rest);
  return out;
}

/** Reply box with live-formatted markdown, a formatting toolbar, preview, character counter and send button. */
export function Composer({ onSubmit, placeholder = 'Schreib was Nettes …', submitLabel = 'Senden', user, maxLength = 2000, className, ...rest }: ComposerProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text, preview]);
  useEffect(() => { if (!preview) area.current?.focus({ preventScroll: true }); }, [preview]);

  /** Replaces a range through the browser's edit command (keeps undo) and falls back to setRangeText. */
  function replace(el: HTMLTextAreaElement, from: number, to: number, value: string) {
    el.setSelectionRange(from, to);
    if (!document.execCommand('insertText', false, value)) {
      el.setRangeText(value, from, to, 'end');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  /** Wraps the selection (or inserts an empty pair) and leaves the cursor where typing should go on. Wrapping again removes it. */
  function format(open: string, close = open) {
    const el = area.current;
    if (!el) return;
    el.focus();
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e);
    if (sel.length >= open.length + close.length && sel.startsWith(open) && sel.endsWith(close)) {
      const inner = sel.slice(open.length, sel.length - close.length);
      replace(el, s, e, inner);
      el.setSelectionRange(s, s + inner.length);
    } else if (value.slice(s - open.length, s) === open && value.slice(e, e + close.length) === close) {
      replace(el, s - open.length, e + close.length, sel);
      el.setSelectionRange(s - open.length, s - open.length + sel.length);
    } else if (sel) {
      replace(el, s, e, open + sel + close);
      const urlStart = s + open.length + sel.length + close.indexOf('(') + 1;
      if (close.includes('(')) el.setSelectionRange(urlStart, urlStart + close.length - close.indexOf('(') - 2);
      else el.setSelectionRange(s + open.length + sel.length + close.length, s + open.length + sel.length + close.length);
    } else {
      replace(el, s, e, open + close);
      el.setSelectionRange(s + open.length, s + open.length);
    }
  }
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); format('**'); }
    else if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); format('_'); }
    else if (mod && e.key === 'Enter') { e.preventDefault(); e.currentTarget.form?.requestSubmit(); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      await onSubmit(text.trim());
      setText('');
      setPreview(false);
    } finally {
      setBusy(false);
    }
  }
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();
  return (
    <form className={cx('pp-composer', className)} onSubmit={submit} {...rest}>
      {user && <Avatar name={user} size="sm" />}
      <div className="pp-composer-box">
        <div className="pp-composer-tools" role="toolbar" aria-label="Formatierung">
          <button type="button" onMouseDown={keepFocus} onClick={() => format('**')} disabled={preview} aria-label="Fett" title="Fett (Strg+B)"><b>B</b></button>
          <button type="button" onMouseDown={keepFocus} onClick={() => format('_')} disabled={preview} aria-label="Kursiv" title="Kursiv (Strg+I)"><i>I</i></button>
          <button type="button" onMouseDown={keepFocus} onClick={() => format('`')} disabled={preview} aria-label="Code" title="Code"><Icon name="code" size={15} /></button>
          <button type="button" onMouseDown={keepFocus} onClick={() => format('[', '](https://)')} disabled={preview} aria-label="Link" title="Link"><Icon name="link" size={15} /></button>
          <button type="button" className="pp-composer-preview-btn" aria-pressed={preview} onClick={() => setPreview((p) => !p)} title="Vorschau"><Icon name="eye" size={15} />Vorschau</button>
        </div>
        {preview ? (
          <div className="pp-composer-preview" aria-label="Vorschau">
            {text.trim() ? text.trim().split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para.split('\n').flatMap((line, j) => [j > 0 && <br key={`b${j}`} />, ...renderMd(line, false, `${i}-${j}-`)])}</p>
            )) : <p className="pp-soft">Noch nichts zu sehen.</p>}
          </div>
        ) : (
          <div className="pp-composer-editor">
            <div className="pp-composer-mirror" aria-hidden="true">{renderMd(text, true)}{'\n'}</div>
            <textarea ref={area} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} maxLength={maxLength} rows={3} aria-label={placeholder} />
          </div>
        )}
        <div className="pp-composer-foot">
          <small className={text.length > maxLength * 0.9 ? 'pp-warn' : undefined}>{text.length} / {maxLength}</small>
          <button type="submit" className="pp-btn pp-btn-sm pp-c-pink" disabled={busy || !text.trim()}><Icon name="send" size={16} />{submitLabel}</button>
        </div>
      </div>
    </form>
  );
}

export interface UserCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Display name. */
  name: string;
  /** @handle or subtitle. */
  handle?: string;
  /** Avatar URL. */
  src?: string;
  /** Short bio. */
  bio?: ReactNode;
  /** Role badges. */
  badges?: Array<{ label: string; color?: Tone }>;
  /** Stats row, e.g. [{ label: 'Beiträge', value: 128 }]. */
  stats?: Array<{ label: string; value: ReactNode }>;
  /** Buttons (Folgen, Nachricht). */
  actions?: ReactNode;
  /** Header colour. @default 'lilac' */
  color?: PaperColor;
}

/** Profile card with polaroid avatar, badges, stats and actions. */
export function UserCard({ name, handle, src, bio, badges, stats, actions, color = 'lilac', className, ...rest }: UserCardProps) {
  return (
    <div className={cx('pp-usercard', `pp-c-${color}`, className)} {...rest}>
      <div className="pp-usercard-cover" aria-hidden="true" />
      <div className="pp-usercard-photo" style={vars({ '--r': deg(-5) })}><Avatar name={name} src={src} size={84} /></div>
      <h3 className="pp-display">{name}</h3>
      {handle && <span className="pp-soft pp-usercard-handle">{handle}</span>}
      {badges && <div className="pp-usercard-badges">{badges.map((b) => <span key={b.label} className={cx('pp-tag', `pp-c-${b.color ?? 'butter'}`)}>{b.label}</span>)}</div>}
      {bio && <p className="pp-usercard-bio">{bio}</p>}
      {stats && <dl className="pp-usercard-stats">{stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd className="pp-display">{s.value}</dd></div>)}</dl>}
      {actions && <div className="pp-usercard-actions">{actions}</div>}
    </div>
  );
}

export interface CategoryCardProps extends Omit<HTMLAttributes<HTMLAnchorElement>, 'title'> {
  /** Category name. */
  title: ReactNode;
  /** Description. */
  description?: ReactNode;
  /** Icon. */
  icon: IconName;
  /** Colour. @default 'sky' */
  color?: PaperColor;
  /** Thread count. */
  threads?: number;
  /** Post count. */
  posts?: number;
  /** Link. */
  href: string;
}

/** A forum board/category tile with icon, description and counters. */
export function CategoryCard({ title, description, icon, color = 'sky', threads, posts, href, className, ...rest }: CategoryCardProps) {
  return (
    <a href={href} className={cx('pp-category', `pp-c-${color}`, className)} {...rest}>
      <span className="pp-category-icon"><Icon name={icon} size={26} /></span>
      <span className="pp-category-text">
        <b className="pp-display">{title}</b>
        {description && <small>{description}</small>}
      </span>
      <span className="pp-category-counts">
        {threads !== undefined && <span><b>{threads}</b> Themen</span>}
        {posts !== undefined && <span><b>{posts}</b> Beiträge</span>}
      </span>
    </a>
  );
}
