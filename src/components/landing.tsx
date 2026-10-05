// Made by Jack (iamjustjack.de)
import { useEffect, useRef, useState, type FormEvent, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx, deg, vars } from '../lib/util';
import type { PaperColor, TornEdge } from '../types';
import { Heading, Kicker, Paper, Polaroid, Sticker, Washi } from './foundations';
import { Icon, type IconName } from './Icon';

export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Handwritten line above the title. */
  kicker?: ReactNode;
  /** Big title. Wrap a word in <em> for the accent colour. */
  title: ReactNode;
  /** Lead paragraph. */
  lead?: ReactNode;
  /** Buttons under the lead. */
  actions?: ReactNode;
  /** Right column: an image URL (shown as a polaroid) or any node. */
  media?: string | ReactNode;
  /** Caption for the polaroid when media is a URL. */
  mediaCaption?: ReactNode;
  /** Title sheet colour. @default 'lilac' */
  color?: PaperColor;
  /** id for the title, e.g. to point aria-labelledby at it. */
  titleId?: string;
  /** Extra decorations (absolutely positioned icons, doodles) inside the hero. */
  children?: ReactNode;
}

/** Big torn title sheet next to a polaroid - the iamjustjack.de hero. */
export function Hero({ kicker, title, lead, actions, media, mediaCaption, color = 'lilac', titleId, children, className, ...rest }: HeroProps) {
  return (
    <section className={cx('pp-hero', !media && 'pp-hero-solo', className)} aria-labelledby={titleId} {...rest}>
      <Paper color={color} edge="big-1" tilt={-1.2} pad="clamp(32px, 5vw, 64px)" className="pp-hero-card">
        {kicker && <Kicker>{kicker}</Kicker>}
        <Heading level={1} size="xxl" accent="paper" id={titleId}>{title}</Heading>
        {lead && <p className="pp-hero-lead">{lead}</p>}
        {actions && <div className="pp-hero-actions">{actions}</div>}
      </Paper>
      {media && (
        <div className="pp-hero-media">
          {typeof media === 'string' ? <Polaroid src={media} caption={mediaCaption} tape tilt={5} width="100%" /> : media}
        </div>
      )}
      {children}
    </section>
  );
}

export interface Feature {
  icon: IconName;
  title: ReactNode;
  text: ReactNode;
  color?: PaperColor;
}

export interface FeatureCardProps extends Feature, Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  /** Torn edge. @default 'card-1' */
  edge?: TornEdge;
  /** Rotation in degrees. @default 0 */
  tilt?: number;
}

/** Paper card with an icon sticker, title and short text. */
export function FeatureCard({ icon, title, text, color = 'paper', edge = 'card-1', tilt, className, ...rest }: FeatureCardProps) {
  return (
    <Paper color={color} edge={edge} tilt={tilt} pad="30px 28px 32px" className={cx('pp-feature', className)} {...rest}>
      <span className="pp-feature-icon"><Icon name={icon} size={26} /></span>
      <h3 className="pp-display">{title}</h3>
      <p>{text}</p>
    </Paper>
  );
}

export interface FeatureGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Features. Colours and tilts vary automatically. */
  items: Feature[];
  /** Columns on wide screens. @default 3 */
  columns?: number;
}

/** A grid of FeatureCards with alternating colours and tilts. */
export function FeatureGrid({ items, columns = 3, className, style, ...rest }: FeatureGridProps) {
  const colors: PaperColor[] = ['butter', 'mint', 'sky', 'pink', 'lilac', 'paper'];
  const edges: TornEdge[] = ['card-1', 'card-2', 'card-3', 'card-4', 'card-5'];
  return (
    <div className={cx('pp-features', className)} style={{ ...vars({ '--cols': columns }), ...style }} {...rest}>
      {items.map((f, i) => <FeatureCard key={i} {...f} color={f.color ?? colors[i % colors.length]} edge={edges[i % edges.length]} tilt={[-1.2, 0.8, -0.5, 1.3][i % 4]} />)}
    </div>
  );
}

export interface Plan {
  name: ReactNode;
  price: ReactNode;
  /** e.g. "/ Monat". */
  period?: ReactNode;
  description?: ReactNode;
  features: ReactNode[];
  cta: ReactNode;
  href?: string;
  onSelect?: () => void;
  /** Highlight with a sticker and colour. */
  featured?: boolean;
  /** Sticker text for featured plans. @default 'Beliebt!' */
  badge?: ReactNode;
  color?: PaperColor;
}

export interface PricingCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  plan: Plan;
  /** Rotation in degrees. @default 0 */
  tilt?: number;
}

/** One pricing plan on a paper card; featured plans get a sticker and lift. */
export function PricingCard({ plan, tilt, className, style, ...rest }: PricingCardProps) {
  const { name, price, period, description, features, cta, href, onSelect, featured, badge = 'Beliebt!', color } = plan;
  return (
    <div className={cx('pp-plan', featured && 'pp-plan-featured', `pp-c-${color ?? (featured ? 'butter' : 'paper')}`, className)} style={{ ...vars({ '--r': deg(tilt) }), ...style }} {...rest}>
      {featured && <Sticker shape="burst" color="pink" size={92} tilt={14} className="pp-plan-badge">{badge}</Sticker>}
      <span className="pp-caps">{name}</span>
      <div className="pp-plan-price"><b className="pp-display">{price}</b>{period && <span>{period}</span>}</div>
      {description && <p className="pp-plan-desc">{description}</p>}
      <ul>
        {features.map((f, i) => <li key={i}><Icon name="check" size={18} stroke={3} />{f}</li>)}
      </ul>
      {href
        ? <a className={cx('pp-btn', 'pp-btn-block', featured ? 'pp-c-pink' : 'pp-c-paper')} href={href}>{cta}</a>
        : <button type="button" className={cx('pp-btn', 'pp-btn-block', featured ? 'pp-c-pink' : 'pp-c-paper')} onClick={onSelect}>{cta}</button>}
    </div>
  );
}

export interface PricingTableProps extends HTMLAttributes<HTMLDivElement> {
  plans: Plan[];
}

/** Side-by-side pricing plans. */
export function PricingTable({ plans, className, ...rest }: PricingTableProps) {
  return (
    <div className={cx('pp-plans', className)} {...rest}>
      {plans.map((p, i) => <PricingCard key={i} plan={p} tilt={p.featured ? 0 : i % 2 ? 1 : -1} />)}
    </div>
  );
}

export interface TestimonialProps extends Omit<HTMLAttributes<HTMLElement>, 'role' | 'color'> {
  /** The quote. */
  quote: ReactNode;
  /** Who said it. */
  name: ReactNode;
  /** Role / company / handle. */
  role?: ReactNode;
  /** Photo URL - shown as a mini polaroid. */
  src?: string;
  /** Note colour. @default 'butter' */
  color?: PaperColor;
  /** Rotation in degrees. @default -1.5 */
  tilt?: number;
}

/** A quote on a taped-up note with a mini polaroid of the author. */
export function Testimonial({ quote, name, role, src, color = 'butter', tilt = -1.5, className, style, ...rest }: TestimonialProps) {
  return (
    <figure className={cx('pp-quote', `pp-c-${color}`, className)} style={{ ...vars({ '--r': deg(tilt) }), ...style }} {...rest}>
      <Washi width={110} tilt={4} style={{ top: -13, right: 30 }} />
      <span className="pp-quote-mark pp-display" aria-hidden="true">“</span>
      <blockquote>{quote}</blockquote>
      <figcaption>
        {src ? <img src={src} alt="" className="pp-quote-photo" /> : <span className="pp-quote-photo pp-quote-initial pp-display">{String(name).slice(0, 1)}</span>}
        <span><b>{name}</b>{role && <small>{role}</small>}</span>
      </figcaption>
    </figure>
  );
}

export interface CtaBannerProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Headline. */
  title: ReactNode;
  /** Supporting text. */
  text?: ReactNode;
  /** Buttons. */
  actions: ReactNode;
  /** Sheet colour. @default 'pink' */
  color?: PaperColor;
}

/** Wide torn banner with a headline and buttons - end-of-page call to action. */
export function CtaBanner({ title, text, actions, color = 'pink', className, ...rest }: CtaBannerProps) {
  return (
    <Paper as="section" color={color} edge="big-3" tilt={-0.8} pad="clamp(32px, 5vw, 56px)" className={cx('pp-cta', className)} {...rest}>
      <div>
        <h2 className="pp-display pp-cta-title">{title}</h2>
        {text && <p>{text}</p>}
      </div>
      <div className="pp-cta-actions">{actions}</div>
    </Paper>
  );
}

export interface NewsletterProps extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'title'> {
  /** Called with the e-mail address. Throw to show `errorText`. */
  onSubscribe: (email: string) => Promise<void> | void;
  /** Headline. @default 'Post von mir?' */
  title?: ReactNode;
  /** Text under the headline. */
  text?: ReactNode;
  /** Button label. @default 'Eintragen' */
  cta?: ReactNode;
  /** Shown after success. @default 'Du bist dabei ♥' */
  successText?: ReactNode;
  /** Shown on error. @default 'Hat nicht geklappt, versuch es nochmal.' */
  errorText?: ReactNode;
}

/** E-mail signup on an envelope-ish card with a success stamp. */
export function Newsletter({ onSubscribe, title = 'Post von mir?', text, cta = 'Eintragen', successText = 'Du bist dabei ♥', errorText = 'Hat nicht geklappt, versuch es nochmal.', className, ...rest }: NewsletterProps) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    setState('busy');
    try {
      await onSubscribe(email);
      setState('done');
    } catch {
      setState('error');
    }
  }
  return (
    <form className={cx('pp-newsletter', state === 'done' && 'pp-newsletter-done', className)} onSubmit={submit} {...rest}>
      <div className="pp-newsletter-text">
        <h3 className="pp-display">{title}</h3>
        {text && <p>{text}</p>}
      </div>
      <div className="pp-newsletter-row">
        <input className="pp-input pp-input-box" type="email" name="email" required placeholder="du@irgendwo.de" aria-label="E-Mail-Adresse" disabled={state === 'done'} />
        <button className="pp-btn pp-btn-sm pp-c-pink" type="submit" disabled={state === 'busy' || state === 'done'}>{state === 'busy' ? '…' : cta}</button>
      </div>
      {state === 'error' && <p className="pp-newsletter-error" role="alert">{errorText}</p>}
      <div className={cx('pp-stamp', 'pp-stamp-overlay', 'pp-c-mint', state === 'done' && 'pp-stamp-on')} role="status" style={vars({ '--r': '-10deg' })}>{state === 'done' && successText}</div>
    </form>
  );
}

export interface PolaroidStackItem {
  title: ReactNode;
  href?: string;
  src?: string;
  tag?: string;
  color?: PaperColor;
  /** Second stripe colour of the placeholder photo (any CSS colour). */
  color2?: string;
  /** Custom photo content (icon, big letter). Defaults to the first letter of the title. */
  photo?: ReactNode;
}

export interface PolaroidStackProps extends HTMLAttributes<HTMLDivElement> {
  /** 2 - 5 items. */
  items: PolaroidStackItem[];
  /** Handwritten hint under the closed stack. @default '↑ drüberfahren (oder antippen)' */
  hint?: ReactNode;
  /** Polaroid width in px at every size. Leave empty for the responsive default (230 / 190 / 170 / 150 px). */
  width?: number;
}

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

/**
 * A pile of polaroids that fans out on hover. On touch devices it opens when scrolled into view or on
 * the first tap; links only follow once it is open. Tablets and phones get a two-column fan.
 */
export function PolaroidStack({ items, hint = '↑ drüberfahren', width, className, style, ...rest }: PolaroidStackProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (!canHover()) {
      const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setOpen(true), { threshold: 0.35 });
      io.observe(el);
      return () => io.disconnect();
    }
    const close = (e: globalThis.MouseEvent) => !el.contains(e.target as Node) && setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  function onClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest('a');
    if (!open && !canHover()) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!link) setOpen((o) => !o);
  }
  const n = items.length;
  const mid = (n - 1) / 2;
  const rows = Math.ceil(n / 2);
  return (
    <div
      ref={ref}
      className={cx('pp-pstack', open && 'pp-pstack-open', className)}
      style={{ ...vars({ '--pw': width ? `${width}px` : undefined, '--rows': rows }), ...style }}
      onClick={onClick}
      {...rest}
    >
      {items.map((it, i) => {
        const Tag = it.href ? 'a' : 'div';
        const off = i - mid;
        const col = n % 2 === 1 && i === n - 1 ? 0 : i % 2 ? 1 : -1;
        return (
          <Tag
            key={i}
            href={it.href}
            className="pp-pstack-item"
            style={vars({
              '--off': off, '--aoff': Math.abs(off), '--rest': `${[-7, 4, -2, 6, -4][i % 5]}deg`, '--z': i + 1,
              '--col': col, '--row': Math.floor(i / 2), '--mdy': i % 2 ? '10px' : '0px', '--mfan': `${[-4, 3, -2, 4][i % 4]}deg`,
            })}
          >
            <Polaroid src={it.src} tag={it.tag} color={it.color ?? (['sky', 'pink', 'mint', 'butter', 'lilac'] as const)[i % 5]} color2={it.color2} caption={it.title} width="100%">
              {it.photo ?? <span className="pp-pstack-letter">{String(it.title).slice(0, 1)}</span>}
            </Polaroid>
          </Tag>
        );
      })}
      {hint && <span className="pp-pstack-hint" aria-hidden="true">{hint}</span>}
    </div>
  );
}

export interface LinkCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Icon in the circle. */
  icon: IconName;
  /** Main line. */
  title: ReactNode;
  /** Second line (handle, hint). */
  subtitle?: ReactNode;
  /** Small glyph on the right. @default '→' ('↗' for external links, '⧉' for copy cards) */
  action?: ReactNode;
  /** Link target. */
  href?: string;
  /** Copy this text to the clipboard instead of navigating (for Discord/Signal names). */
  copyText?: string;
  /** Open in a new tab. @default true for http(s) links */
  newTab?: boolean;
  /** Sheet colour. @default 'pink' */
  color?: PaperColor;
  /** Torn edge. @default 'card-1' */
  edge?: TornEdge;
  /** Rotation in degrees. @default 0 */
  tilt?: number;
}

/** Link-in-bio row on a torn card: icon, title, subtitle and an arrow. Can also copy a username. */
export function LinkCard({ icon, title, subtitle, action, href, copyText, newTab, color = 'pink', edge = 'card-1', tilt, className, style, ...rest }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const external = newTab ?? (!!href && /^https?:/.test(href));
  const cls = cx('pp-paper', `pp-bg-${color}`, `pp-t-${edge}`, 'pp-linkcard', className);
  const st = { ...vars({ '--r': deg(tilt) }), ...style };
  const body = (
    <>
      <span className="pp-linkcard-icon"><Icon name={icon} size={24} /></span>
      <span className="pp-linkcard-text"><b>{title}</b>{subtitle && <small>{copied ? 'kopiert ✓' : subtitle}</small>}</span>
      <span className="pp-linkcard-action" aria-hidden="true">{copied ? '✓' : action ?? (copyText ? '⧉' : external ? '↗' : '→')}</span>
    </>
  );
  if (copyText !== undefined) {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        window.prompt('Zum Kopieren:', copyText);
      }
    };
    return <button type="button" className={cls} style={st} onClick={copy} {...(rest as HTMLAttributes<HTMLButtonElement>)}>{body}</button>;
  }
  return (
    <a href={href} className={cls} style={st} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
      {body}
    </a>
  );
}

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Items that scroll by, separated by sparkles. */
  items: ReactNode[];
  /** Seconds per loop. @default 24 */
  speed?: number;
  /** Tape style background. @default 'butter' */
  color?: PaperColor | 'washi';
  /** Rotation in degrees. @default -2 */
  tilt?: number;
  /** Scroll right-to-left (default) or reverse. */
  reverse?: boolean;
}

/** An endless strip of tape with scrolling text - between sections or as a ticker. */
export function Marquee({ items, speed = 24, color = 'butter', tilt = -2, reverse, className, style, ...rest }: MarqueeProps) {
  const row = (hidden: boolean) => (
    <div className="pp-marquee-row" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="pp-marquee-item">{it}<Icon name="sparkle" size={20} /></span>
      ))}
    </div>
  );
  return (
    <div className={cx('pp-marquee', color === 'washi' ? 'pp-marquee-washi' : `pp-c-${color}`, reverse && 'pp-marquee-reverse', className)} style={{ ...vars({ '--r': deg(tilt), '--speed': `${speed}s` }), ...style }} {...rest}>
      <div className="pp-marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}

export interface LogoCloudProps extends HTMLAttributes<HTMLDivElement> {
  /** Handwritten label. @default 'bekannt aus' */
  label?: ReactNode;
  /** Logos: image URLs or text names (rendered as label-maker tags). */
  logos: Array<{ name: string; src?: string }>;
}

/** "As seen on" row - image logos or label-maker text tags. */
export function LogoCloud({ label = 'bekannt aus', logos, className, ...rest }: LogoCloudProps) {
  return (
    <div className={cx('pp-logos', className)} {...rest}>
      {label && <span className="pp-hand pp-logos-label">{label}</span>}
      <ul>
        {logos.map((l, i) => (
          <li key={l.name} style={vars({ '--r': `${[-3, 2, -1, 3, -2][i % 5]}deg` })}>
            {l.src ? <img src={l.src} alt={l.name} /> : <span className="pp-display">{l.name}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
