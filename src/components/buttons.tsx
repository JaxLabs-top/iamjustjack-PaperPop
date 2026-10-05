// Made by Jack (iamjustjack.de)
import { useEffect, useLayoutEffect, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx, deg, reducedMotion, vars } from '../lib/util';
import type { PaperColor, Size, Tone } from '../types';
import { burstSparkles } from './effects';
import { Icon, type IconName } from './Icon';

type Clickable = ButtonHTMLAttributes<HTMLButtonElement> & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'>;

function ButtonOrLink({ href, target, rel, type = 'button', ...rest }: Clickable) {
  if (href) return <a href={href} target={target} rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)} {...(rest as HTMLAttributes<HTMLAnchorElement>)} />;
  return <button type={type} {...rest} />;
}

export interface ButtonProps extends Clickable {
  /** Fill colour. @default 'pink' */
  color?: Tone;
  /** Size. @default 'md' */
  size?: Size;
  /** Rotation in degrees - the slightly crooked look. @default -3 */
  tilt?: number;
  /** Icon before the label. */
  icon?: IconName;
  /** Icon after the label. */
  iconRight?: IconName;
  /** Shows a spinning sparkle and disables the button. */
  loading?: boolean;
  /** Full width. */
  block?: boolean;
}

/** The chunky, slightly crooked Paper Pop button with a hard ink shadow. Renders a link when `href` is set. */
export function Button({ color = 'pink', size = 'md', tilt = -3, icon, iconRight, loading, block, className, style, children, disabled, ...rest }: ButtonProps) {
  return (
    <ButtonOrLink
      className={cx('pp-btn', `pp-btn-${size}`, `pp-c-${color}`, block && 'pp-btn-block', loading && 'pp-btn-loading', className)}
      style={{ ...vars({ '--r': deg(tilt) }), ...style }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Icon name="sparkle" className="pp-btn-spin" size={size === 'sm' ? 16 : 20} /> : icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 20} />}
    </ButtonOrLink>
  );
}

export interface PillProps extends Clickable {
  /** Marks the pill as selected / current page. */
  active?: boolean;
  /** Colour when hovered or active. @default 'pink' */
  color?: PaperColor;
  /** Icon before the label. */
  icon?: IconName;
  /** Compact version. */
  small?: boolean;
}

/** Outlined, rounded secondary button - used for navigation, filters and secondary actions. */
export function Pill({ active, color = 'pink', icon, small, className, children, ...rest }: PillProps) {
  return (
    <ButtonOrLink className={cx('pp-pill', `pp-c-${color}`, active && 'pp-pill-on', small && 'pp-pill-sm', className)} aria-current={active && rest.href ? 'page' : undefined} aria-pressed={active !== undefined && !rest.href ? active : undefined} {...rest}>
      {icon && <Icon name={icon} size={small ? 15 : 18} />}
      {children}
    </ButtonOrLink>
  );
}

export interface IconButtonProps extends Clickable {
  /** Icon to show. */
  icon: IconName;
  /** Accessible label (required - there is no visible text). */
  label: string;
  /** Fill colour. @default 'paper' */
  color?: Tone;
  /** Size. @default 'md' */
  size?: Size;
  /** Small counter badge. */
  badge?: number;
}

/** Round button with just an icon, optional counter badge. */
export function IconButton({ icon, label, color = 'paper', size = 'md', badge, className, ...rest }: IconButtonProps) {
  return (
    <ButtonOrLink className={cx('pp-iconbtn', `pp-iconbtn-${size}`, `pp-c-${color}`, className)} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={size === 'lg' ? 26 : size === 'sm' ? 16 : 20} />
      {!!badge && <span className="pp-iconbtn-badge">{badge > 99 ? '99+' : badge}</span>}
    </ButtonOrLink>
  );
}

export interface SegmentedControlProps<T extends string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Options as values or { value, label, icon }. */
  options: Array<T | { value: T; label: ReactNode; icon?: IconName }>;
  /** Selected value. */
  value: T;
  /** Called with the new value. */
  onChange: (value: T) => void;
  /** Accessible group label. */
  label?: string;
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** A row of connected toggle buttons for switching views (Tag / Woche / Monat). The ink pill slides to the chosen option. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, className, ...rest }: SegmentedControlProps<T>) {
  const root = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const [ready, setReady] = useState(false);
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

  useIsoLayoutEffect(() => {
    const measure = () => {
      const el = root.current?.querySelector<HTMLElement>('[aria-checked="true"]');
      if (el) setPill((p) => (p && p.x === el.offsetLeft && p.w === el.offsetWidth ? p : { x: el.offsetLeft, w: el.offsetWidth }));
    };
    measure();
    if (typeof ResizeObserver === 'undefined' || !root.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(root.current);
    return () => ro.disconnect();
  }, [value, options.length]);
  useEffect(() => { const t = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(t); }, []);

  function onKey(e: React.KeyboardEvent) {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = opts.findIndex((o) => o.value === value);
    const next = opts[(i + dir + opts.length) % opts.length];
    if (next) { onChange(next.value); root.current?.querySelectorAll<HTMLElement>('[role=radio]')[opts.indexOf(next)]?.focus(); }
  }

  return (
    <div ref={root} role="radiogroup" aria-label={label} className={cx('pp-segmented', ready && 'pp-segmented-ready', className)} onKeyDown={onKey} {...rest}>
      {pill && <span className="pp-segmented-pill" aria-hidden="true" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} />}
      {opts.map((opt) => {
        const on = opt.value === value;
        return (
          <button key={opt.value} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} className={on ? 'on' : undefined} onClick={() => onChange(opt.value)}>
            {'icon' in opt && opt.icon && <Icon name={opt.icon} size={16} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export interface FabProps extends Clickable {
  /** Icon. @default 'plus' */
  icon?: IconName;
  /** Accessible label; also shown as a handwritten hint when `hint` is set. */
  label: string;
  /** Show the label as a handwritten note next to the button. */
  hint?: boolean;
  /** Colour. @default 'butter' */
  color?: Tone;
  /** Stick to the bottom right corner of the viewport. */
  fixed?: boolean;
}

/** Floating action button - a big round sticker that wiggles for attention. */
export function Fab({ icon = 'plus', label, hint, color = 'butter', fixed, className, ...rest }: FabProps) {
  return (
    <span className={cx('pp-fab-wrap', fixed && 'pp-fab-fixed', className)}>
      {hint && <span className="pp-fab-hint pp-hand" aria-hidden="true">{label}</span>}
      <ButtonOrLink className={cx('pp-fab', `pp-c-${color}`)} aria-label={label} title={label} {...rest}>
        <Icon name={icon} size={30} stroke={2.8} />
      </ButtonOrLink>
    </span>
  );
}

export interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onCopy'> {
  /** Text that goes to the clipboard. */
  text: string;
  /** Label before copying. @default 'Kopieren' */
  label?: ReactNode;
  /** Label after copying. @default 'Kopiert!' */
  done?: ReactNode;
  /** Called after a successful copy. */
  onCopied?: () => void;
}

/** Copies text to the clipboard and flips to a little "Kopiert!" stamp for two seconds. */
export function CopyButton({ text, label = 'Kopieren', done = 'Kopiert!', onCopied, className, ...rest }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
    }
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" className={cx('pp-pill', 'pp-copy', 'pp-c-mint', copied && 'pp-copy-done', className)} onClick={copy} {...rest}>
      <Icon name={copied ? 'check' : 'copy'} size={17} />
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}

export interface LikeButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Current like state (controlled). Leave undefined to let the button manage itself. */
  liked?: boolean;
  /** Like count before the user's own like. @default 0 */
  count?: number;
  /** Called with the new state. */
  onChange?: (liked: boolean) => void;
  /** Accessible label. @default 'Gefällt mir' */
  label?: string;
}

/** Heart button: a pink wave floods the whole button and sparkles fly across it when liked. */
export function LikeButton({ liked, count = 0, onChange, label = 'Gefällt mir', className, ...rest }: LikeButtonProps) {
  const [own, setOwn] = useState(false);
  const [wave, setWave] = useState(0);
  const on = liked ?? own;
  function toggle(e: MouseEvent<HTMLButtonElement>) {
    const next = !on;
    if (liked === undefined) setOwn(next);
    onChange?.(next);
    if (next && !reducedMotion()) {
      setWave((n) => n + 1);
      const r = e.currentTarget.getBoundingClientRect();
      const y = r.top + r.height / 2;
      [0.18, 0.5, 0.82].forEach((f, i) => setTimeout(() => burstSparkles(r.left + r.width * f, y, 6), i * 90));
    }
  }
  return (
    <button type="button" aria-pressed={on} aria-label={label} className={cx('pp-like', on && 'pp-like-on', className)} onClick={toggle} {...rest}>
      {wave > 0 && <span key={wave} className="pp-like-wave" aria-hidden="true" />}
      <Icon name={on ? 'heart' : 'heart-outline'} size={22} />
      <span>{count + (on && liked === undefined ? 1 : 0)}</span>
    </button>
  );
}

export interface SocialLink {
  label: string;
  /** Link target. Leave out together with `copy` for plain text. */
  href?: string;
  /** Instead of a link: copies this text (a handle) to the clipboard on click. */
  copy?: string;
  icon: IconName;
  /** Tooltip, e.g. the handle. */
  title?: string;
}

/** Jack's real channels from links.iamjustjack.de - the default of SocialLinks. */
export const JACK_SOCIALS: SocialLink[] = [
  { label: 'Formular', href: 'https://iamjustjack.de/#contact', icon: 'send', title: 'landet direkt bei mir' },
  { label: 'Instagram', href: 'https://www.instagram.com/iamjustjack.de/', icon: 'instagram', title: '@iamjustjack.de' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@iamjustjack.de', icon: 'tiktok', title: '@iamjustjack.de' },
  { label: 'Discord', copy: 'iamjustjack.de', icon: 'discord', title: 'Name kopieren: iamjustjack.de' },
  { label: 'Signal', copy: 'jackfeuchte.01', icon: 'signal', title: 'Name kopieren: jackfeuchte.01' },
  { label: 'E-Mail', href: 'mailto:hello@iamjustjack.de', icon: 'mail', title: 'hello@iamjustjack.de' },
];

export interface SocialLinksProps extends HTMLAttributes<HTMLUListElement> {
  /** Links with icon; entries with `copy` instead of `href` copy a handle. @default JACK_SOCIALS */
  items?: SocialLink[];
}

/** Small chip links for social profiles and contact channels. Without `items` it shows Jack's own channels. */
export function SocialLinks({ items = JACK_SOCIALS, className, ...rest }: SocialLinksProps) {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(s: SocialLink) {
    void navigator.clipboard?.writeText(s.copy ?? '').then(() => {
      setCopied(s.label);
      setTimeout(() => setCopied((c) => (c === s.label ? null : c)), 1600);
    });
  }
  return (
    <ul className={cx('pp-social', className)} {...rest}>
      {items.map((s) => (
        <li key={`${s.label}-${s.href ?? s.copy}`}>
          {s.href ? (
            <a href={s.href} title={s.title} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              <Icon name={s.icon} size={18} />
              {s.label}
            </a>
          ) : (
            <button type="button" title={s.title} onClick={() => copy(s)}>
              <Icon name={copied === s.label ? 'check' : s.icon} size={18} />
              <span aria-live="polite">{copied === s.label ? 'kopiert' : s.label}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
