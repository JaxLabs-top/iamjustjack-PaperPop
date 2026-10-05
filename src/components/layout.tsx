// Made by Jack (iamjustjack.de)
import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx, deg, len, vars } from '../lib/util';
import type { Tone } from '../types';
import { Heading, Kicker } from './foundations';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Max width. @default 1280 */
  max?: number | string;
  /** Rendered element. @default 'div' */
  as?: ElementType;
}

/** Centered page column with a 16px gutter on phones. */
export function Container({ max, as: Tag = 'div', className, style, ...rest }: ContainerProps) {
  return <Tag className={cx('pp-container', className)} style={{ ...vars({ '--pp-max': len(max) }), ...style }} {...rest} />;
}

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Handwritten line above the title. */
  kicker?: ReactNode;
  /** Section heading (big display font). */
  title?: ReactNode;
  /** Intro paragraph under the heading. */
  intro?: ReactNode;
  /** Content on the right side of the heading row (links, buttons). */
  aside?: ReactNode;
  /** Vertical padding. @default 'md' */
  space?: 'sm' | 'md' | 'lg';
}

/** Page section with kicker, heading, intro and consistent spacing. */
export function Section({ kicker, title, intro, aside, space = 'md', className, children, ...rest }: SectionProps) {
  return (
    <section className={cx('pp-section', `pp-section-${space}`, className)} {...rest}>
      {(kicker || title || aside) && (
        <div className="pp-section-head">
          <div>
            {kicker && <Kicker>{kicker}</Kicker>}
            {title && <Heading size="lg">{title}</Heading>}
            {intro && <p className="pp-section-intro">{intro}</p>}
          </div>
          {aside && <div className="pp-section-aside">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Gap between children (number = px). @default 16 */
  gap?: number | string;
  /** Row instead of column. */
  row?: boolean;
  /** align-items. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** justify-content. */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Wrap rows. @default true for rows */
  wrap?: boolean;
  /** Rendered element. @default 'div' */
  as?: ElementType;
}

/** Flexbox helper for vertical or horizontal stacks with a gap. */
export function Stack({ gap = 16, row, align, justify, wrap, as: Tag = 'div', className, style, ...rest }: StackProps) {
  return (
    <Tag
      className={cx('pp-stack', row && 'pp-stack-row', className)}
      style={{
        gap: len(gap),
        alignItems: align === 'start' || align === 'end' ? `flex-${align}` : align,
        justifyContent: justify === 'between' ? 'space-between' : justify === 'start' || justify === 'end' ? `flex-${justify}` : justify,
        flexWrap: (wrap ?? row) ? 'wrap' : undefined,
        ...style,
      }}
      {...rest}
    />
  );
}

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Fixed number of columns, or omit and use `min` for auto-fit. */
  cols?: number;
  /** Minimum column width for auto-fit (number = px). @default 240 */
  min?: number | string;
  /** Gap (number = px). @default 30 */
  gap?: number | string;
  /** Rendered element. @default 'div' */
  as?: ElementType;
}

/** Responsive CSS grid: fixed columns (collapsing on phones) or auto-fit by min width. */
export function Grid({ cols, min = 240, gap = 30, as: Tag = 'div', className, style, ...rest }: GridProps) {
  return (
    <Tag
      className={cx('pp-grid', cols ? 'pp-grid-cols' : 'pp-grid-auto', className)}
      style={{ ...vars({ '--cols': cols, '--min': len(min), '--gap': len(gap) }), ...style }}
      {...rest}
    />
  );
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Card title. */
  title?: ReactNode;
  /** Small caps line above the title. */
  eyebrow?: ReactNode;
  /** Content in the top right (menu, badge). */
  actions?: ReactNode;
  /** Bottom row (buttons, meta). */
  footer?: ReactNode;
  /** Background. @default 'paper' */
  color?: Tone;
  /** Rotation in degrees. @default 0 */
  tilt?: number;
  /** Lift and straighten on hover (for clickable cards). */
  hover?: boolean;
  /** Inner padding (number = px). @default 24 */
  pad?: number | string;
  /** Rendered element, e.g. 'a' or 'article'. @default 'div' */
  as?: ElementType;
  /** href when as="a". */
  href?: string;
}

/**
 * Ink-bordered card with a hard offset shadow. Use it for UI (dashboards, lists, apps);
 * use Paper for the torn, decorative sheets.
 */
export function Card({ title, eyebrow, actions, footer, color = 'paper', tilt, hover, pad = 24, as: Tag = 'div', className, style, children, ...rest }: CardProps) {
  return (
    <Tag className={cx('pp-card', `pp-c-${color}`, hover && 'pp-card-hover', className)} style={{ ...vars({ '--r': deg(tilt), '--pad': len(pad) }), ...style }} {...rest}>
      {(title || eyebrow || actions) && (
        <div className="pp-card-head">
          <div>
            {eyebrow && <span className="pp-caps pp-card-eyebrow">{eyebrow}</span>}
            {title && <h3 className="pp-display pp-card-title">{title}</h3>}
          </div>
          {actions && <div className="pp-card-actions">{actions}</div>}
        </div>
      )}
      {children}
      {footer && <div className="pp-card-footer">{footer}</div>}
    </Tag>
  );
}

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Line style. @default 'dashed' */
  variant?: 'dashed' | 'squiggle' | 'washi';
  /** Text in the middle. */
  label?: ReactNode;
}

/** Horizontal divider - dashed, squiggly or a strip of washi tape. */
export function Divider({ variant = 'dashed', label, className, ...rest }: DividerProps) {
  return (
    <div role="separator" className={cx('pp-divider', `pp-divider-${variant}`, className)} {...rest}>
      {label && <span className="pp-hand">{label}</span>}
    </div>
  );
}
