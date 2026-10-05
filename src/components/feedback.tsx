// Made by Jack (iamjustjack.de)
import {
  createContext, useCallback, useContext, useEffect, useId, useRef, useState,
  type HTMLAttributes, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx, deg, len, vars } from '../lib/util';
import type { PaperColor, Tone } from '../types';
import { Icon, type IconName } from './Icon';

type Status = 'info' | 'success' | 'warning' | 'error';
const STATUS: Record<Status, { color: PaperColor; icon: IconName }> = {
  info: { color: 'sky', icon: 'info' },
  success: { color: 'mint', icon: 'check' },
  warning: { color: 'butter', icon: 'warning' },
  error: { color: 'pink', icon: 'x' },
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Kind of message; sets colour and icon. @default 'info' */
  status?: Status;
  /** Bold first line. */
  title?: ReactNode;
  /** Shows a close button that calls this. */
  onClose?: () => void;
  /** Rotation in degrees. @default -0.6 */
  tilt?: number;
}

/** A taped-on note for info, success, warning and error messages. */
export function Alert({ status = 'info', title, onClose, tilt = -0.6, className, style, children, ...rest }: AlertProps) {
  const s = STATUS[status];
  return (
    <div role={status === 'error' || status === 'warning' ? 'alert' : 'status'} className={cx('pp-alert', `pp-c-${s.color}`, className)} style={{ ...vars({ '--r': deg(tilt) }), ...style }} {...rest}>
      <span className="pp-alert-icon"><Icon name={s.icon} size={20} stroke={2.8} /></span>
      <div className="pp-alert-body">
        {title && <b>{title}</b>}
        {children && <div>{children}</div>}
      </div>
      {onClose && <button type="button" className="pp-alert-close" aria-label="Schließen" onClick={onClose}><Icon name="x" size={16} stroke={3} /></button>}
    </div>
  );
}

export interface ToastOptions {
  /** Main line. */
  title: ReactNode;
  /** Optional second line. */
  description?: ReactNode;
  /** Colour and icon. @default 'success' */
  status?: Status;
  /** Auto-dismiss after ms; 0 keeps it. @default 4000 */
  duration?: number;
}
type ToastItem = ToastOptions & { id: number; leaving?: boolean };

const ToastCtx = createContext<((t: ToastOptions) => void) | null>(null);

/** Returns `toast({ title, description, status })`. Needs a <ToastProvider> above. */
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast() needs a <ToastProvider> around the app');
  return ctx;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Corner for the stack. @default 'bottom-right' */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/** Hosts the toast stack. Wrap your app once, then call useToast() anywhere. */
export function ToastProvider({ children, position = 'bottom-right' }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(0);
  const dismiss = useCallback((id: number) => {
    setItems((all) => all.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setItems((all) => all.filter((t) => t.id !== id)), 250);
  }, []);
  const toast = useCallback(
    (t: ToastOptions) => {
      const id = ++next.current;
      setItems((all) => [...all.slice(-4), { ...t, id }]);
      const ms = t.duration ?? 4000;
      if (ms) setTimeout(() => dismiss(id), ms);
    },
    [dismiss],
  );
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={cx('pp-toasts', `pp-toasts-${position}`)} aria-live="polite">
        {items.map((t, i) => (
          <Toast key={t.id} {...t} tilt={i % 2 ? 1 : -1} onClose={() => dismiss(t.id)} className={t.leaving ? 'pp-toast-out' : undefined} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export interface ToastProps extends ToastOptions {
  onClose?: () => void;
  tilt?: number;
  className?: string;
}

/** A single toast - usually rendered by ToastProvider, but usable on its own. */
export function Toast({ title, description, status = 'success', onClose, tilt = -1, className }: ToastProps) {
  const s = STATUS[status];
  return (
    <div className={cx('pp-toast', `pp-c-${s.color}`, className)} style={vars({ '--r': deg(tilt) })} role="status">
      <span className="pp-alert-icon"><Icon name={s.icon} size={18} stroke={2.8} /></span>
      <div className="pp-alert-body"><b>{title}</b>{description && <div>{description}</div>}</div>
      {onClose && <button type="button" className="pp-alert-close" aria-label="Schließen" onClick={onClose}><Icon name="x" size={14} stroke={3} /></button>}
    </div>
  );
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour. @default 'pink' */
  color?: Tone;
  /** Just a small dot, no text. */
  dot?: boolean;
  /** Pulsing ring, e.g. for "live". */
  pulse?: boolean;
}

/** Small counter or status label. */
export function Badge({ color = 'pink', dot, pulse, className, children, ...rest }: BadgeProps) {
  return <span className={cx('pp-badge', `pp-c-${color}`, dot && 'pp-badge-dot', pulse && 'pp-badge-pulse', className)} {...rest}>{!dot && children}</span>;
}

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour. @default 'butter' */
  color?: Tone;
  /** Icon before the label. */
  icon?: IconName;
  /** Shows an x button. */
  onRemove?: () => void;
}

/** A chip for tags, filters and categories - optionally removable. */
export function Tag({ color = 'butter', icon, onRemove, className, children, ...rest }: TagProps) {
  return (
    <span className={cx('pp-tag', `pp-c-${color}`, className)} {...rest}>
      {icon && <Icon name={icon} size={14} stroke={2.6} />}
      {children}
      {onRemove && <button type="button" aria-label="Entfernen" onClick={onRemove}><Icon name="x" size={12} stroke={3.2} /></button>}
    </span>
  );
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0 - 100. Leave undefined for an indeterminate bar. */
  value?: number;
  /** Visible label above the bar. */
  label?: ReactNode;
  /** Show the percentage on the right. @default true */
  showValue?: boolean;
  /** Fill style. @default 'washi' */
  fill?: 'washi' | PaperColor;
}

/** Progress bar filled with washi tape; indeterminate when no value is given. */
export function Progress({ value, label, showValue = true, fill = 'washi', className, ...rest }: ProgressProps) {
  const pct = value === undefined ? undefined : Math.max(0, Math.min(100, value));
  return (
    <div className={cx('pp-progress', className)} {...rest}>
      {(label || (showValue && pct !== undefined)) && (
        <div className="pp-progress-head"><span>{label}</span>{showValue && pct !== undefined && <b>{Math.round(pct)}%</b>}</div>
      )}
      <div className={cx('pp-progress-track', pct === undefined && 'pp-progress-indet')} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span className={cx('pp-progress-fill', fill !== 'washi' && `pp-c-${fill}`, fill === 'washi' && 'pp-progress-washi')} style={{ width: pct === undefined ? undefined : `${pct}%` }} />
      </div>
    </div>
  );
}

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size in px. @default 44 */
  size?: number;
  /** Visible text next to the spinner, also used as the accessible label. @default 'Lädt …' */
  label?: string;
  /** Show the label. */
  showLabel?: boolean;
}

/** Three sparkles twinkling in a circle - the loading indicator. */
export function Spinner({ size = 44, label = 'Lädt …', showLabel, className, ...rest }: SpinnerProps) {
  return (
    <span className={cx('pp-spinner', className)} role="status" aria-label={label} {...rest}>
      <span className="pp-spinner-ring" style={{ width: size, height: size }}>
        {['pink', 'butter', 'sky'].map((c) => <Icon key={c} name="sparkle" size={size * 0.5} style={{ color: `var(--pp-${c})` }} />)}
      </span>
      {showLabel && <span className="pp-hand">{label}</span>}
    </span>
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Width (number = px). @default '100%' */
  width?: number | string;
  /** Height (number = px). @default 16 */
  height?: number | string;
  /** Round (avatars). */
  circle?: boolean;
  /** Render n text lines instead of one block. */
  lines?: number;
}

/** Shimmering paper placeholder while content loads. */
export function Skeleton({ width = '100%', height = 16, circle, lines, className, style, ...rest }: SkeletonProps) {
  if (lines) {
    return (
      <span className={cx('pp-skeleton-lines', className)} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }, (_, i) => <span key={i} className="pp-skeleton" style={{ width: i === lines - 1 ? '62%' : '100%', height: len(height) }} />)}
      </span>
    );
  }
  return <span className={cx('pp-skeleton', circle && 'pp-skeleton-circle', className)} style={{ width: len(width), height: len(circle ? width : height), ...style }} aria-hidden="true" {...rest} />;
}

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** Tooltip text. */
  content: ReactNode;
  /** Side. @default 'top' */
  side?: 'top' | 'bottom';
  /** Note colour. @default 'butter' */
  color?: PaperColor;
}

/** Little sticky-note tooltip on hover and keyboard focus. */
export function Tooltip({ content, side = 'top', color = 'butter', className, children, ...rest }: TooltipProps) {
  const id = useId();
  return (
    <span className={cx('pp-tooltip', `pp-tooltip-${side}`, className)} aria-describedby={id} {...rest}>
      {children}
      <span role="tooltip" id={id} className={cx('pp-tooltip-note', `pp-c-${color}`)}>{content}</span>
    </span>
  );
}

export interface ModalProps {
  /** Visible or not. */
  open: boolean;
  /** Called on backdrop click, Escape or the close button. */
  onClose: () => void;
  /** Big heading. */
  title: ReactNode;
  /** Content. */
  children?: ReactNode;
  /** Buttons at the bottom. */
  actions?: ReactNode;
  /** Sheet colour. @default 'paper' */
  color?: PaperColor;
  /** Max width in px. @default 520 */
  width?: number;
}

/** A paper sheet that drops onto a dimmed page. Closes on Escape and backdrop click. */
export function Modal({ open, onClose, title, children, actions, color = 'paper', width = 520 }: ModalProps) {
  const id = useId();
  const sheet = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [open, onClose]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="pp-modal-wrap">
      <div className="pp-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={sheet} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id} className={cx('pp-paper', 'pp-t-card-2', `pp-bg-${color}`, 'pp-modal')} style={{ maxWidth: width }}>
        <i className="pp-washi pp-washi-rainbow pp-t-lr-1" style={vars({ '--w': '130px', '--r': '-5deg', top: '-12px', left: '36px' })} aria-hidden="true" />
        <button type="button" className="pp-modal-close" aria-label="Schließen" onClick={onClose}><Icon name="x" size={18} stroke={3} /></button>
        <h2 id={id} className="pp-display pp-modal-title">{title}</h2>
        <div className="pp-modal-body">{children}</div>
        {actions && <div className="pp-modal-actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Icon in the circle. @default 'sparkle' */
  icon?: IconName;
  /** Headline. */
  title: ReactNode;
  /** Explanation. */
  children?: ReactNode;
  /** Button(s). */
  action?: ReactNode;
}

/** "Nothing here yet" block for empty lists, search results and inboxes. */
export function EmptyState({ icon = 'sparkle', title, children, action, className, ...rest }: EmptyStateProps) {
  return (
    <div className={cx('pp-empty', className)} {...rest}>
      <span className="pp-empty-icon"><Icon name={icon} size={34} /></span>
      <h3 className="pp-display">{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export interface ConsentBannerProps {
  /** Show the banner. */
  open: boolean;
  /** Heading. @default 'Kurz was Rechtliches.' */
  title?: ReactNode;
  /** Explanation text. */
  children: ReactNode;
  /** Accept button label. @default 'Passt ♥' */
  acceptLabel?: ReactNode;
  /** Decline button label. @default 'Nur notwendige' */
  declineLabel?: ReactNode;
  /** Accept handler. */
  onAccept: () => void;
  /** Decline handler. */
  onDecline: () => void;
  /** Dim the page behind the banner. @default true */
  backdrop?: boolean;
  /** Small line under the buttons, e.g. the current choice. */
  status?: ReactNode;
}

/** Cookie/consent sticky note in the bottom right corner. Storage is up to you. */
export function ConsentBanner({ open, title = 'Kurz was Rechtliches.', children, acceptLabel = 'Passt ♥', declineLabel = 'Nur notwendige', onAccept, onDecline, backdrop = true, status }: ConsentBannerProps) {
  const id = useId();
  if (!open) return null;
  return (
    <>
      {backdrop && <div className="pp-consent-backdrop" aria-hidden="true" />}
      <aside className="pp-consent" role="dialog" aria-modal={backdrop} aria-labelledby={id}>
        <i className="pp-washi pp-washi-rainbow pp-t-lr-1" style={vars({ '--w': '120px', '--r': '-5deg', left: '30px', top: '-12px' })} aria-hidden="true" />
        <h2 id={id} className="pp-display">{title}</h2>
        <div className="pp-consent-text">{children}</div>
        <div className="pp-consent-actions">
          <button type="button" className="pp-btn pp-c-pink" onClick={onAccept}>{acceptLabel}</button>
          <button type="button" className="pp-pill" onClick={onDecline}>{declineLabel}</button>
        </div>
        {status && <p className="pp-consent-status">{status}</p>}
      </aside>
    </>
  );
}
