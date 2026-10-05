// Made by Jack (iamjustjack.de)
import { useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx, deg, reducedMotion, vars } from '../lib/util';
import type { PaperColor, Size } from '../types';
import { Icon, type IconName } from './Icon';

const PALETTE: PaperColor[] = ['pink', 'sky', 'mint', 'butter', 'lilac'];
const colorVar = (c: string) => (c.startsWith('#') || c.startsWith('var(') ? c : `var(--pp-${c})`);
const fmt = (n: number) => n.toLocaleString('de-DE');

export interface CountUpProps extends HTMLAttributes<HTMLSpanElement> {
  /** Target number. */
  value: number;
  /** Animation length in ms. @default 1200 */
  duration?: number;
  /** Decimal places. @default 0 */
  decimals?: number;
  /** Text before / after the number, e.g. "€" or "%". */
  prefix?: string;
  suffix?: string;
}

/** Counts up to a number when mounted or when the value changes. */
export function CountUp({ value, duration = 1200, decimals = 0, prefix = '', suffix = '', ...rest }: CountUpProps) {
  const [shown, setShown] = useState(reducedMotion() ? value : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reducedMotion()) return setShown(value);
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(a + (value - a) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span {...rest}>{prefix}{shown.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

export interface SparklineProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Data points. */
  values: number[];
  /** Width in px. @default 120 */
  width?: number;
  /** Height in px. @default 36 */
  height?: number;
  /** Line colour (palette name or CSS colour). @default 'ink' */
  color?: string;
  /** Soft area fill under the line. @default true */
  area?: boolean;
}

function toPoints(values: number[], w: number, h: number, pad = 4, min = Math.min(...values), max = Math.max(...values)) {
  const span = max - min || 1;
  return values.map((v, i) => [pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2), h - pad - ((v - min) / span) * (h - pad * 2)] as const);
}

/** Tiny inline line chart for trends inside cards and tables. */
export function Sparkline({ values, width = 120, height = 36, color = 'ink', area = true, className, ...rest }: SparklineProps) {
  const pts = toPoints(values, width, height);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <span className={cx('pp-spark-line', className)} {...rest}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {area && <path d={`${d} L${last?.[0]} ${height} L${pts[0]?.[0]} ${height} Z`} fill={colorVar(color === 'ink' ? 'pink' : color)} opacity=".25" />}
        <path d={d} pathLength={1} className="pp-draw" fill="none" stroke={colorVar(color)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {last && <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--pp-pink)" stroke="var(--pp-ink)" strokeWidth="2" />}
      </svg>
    </span>
  );
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Small caps label ("Besucher heute"). */
  label: ReactNode;
  /** The big number. Numbers count up, strings are shown as they are. */
  value: number | string;
  /** Unit or prefix, e.g. "€" (prefix) - use suffix for "%". */
  prefix?: string;
  suffix?: string;
  /** Change vs. previous period in percent; positive = up (mint), negative = down (pink). */
  delta?: number;
  /** Text after the delta. @default 'vs. Vorwoche' */
  deltaLabel?: ReactNode;
  /** Icon in the corner. */
  icon?: IconName;
  /** Accent colour for the icon badge. @default 'butter' */
  color?: PaperColor;
  /** Trend line in the corner. */
  trend?: number[];
  /** Rotation in degrees. @default 0 */
  tilt?: number;
}

/** KPI card: label, big counting number, delta arrow and optional sparkline. */
export function StatCard({ label, value, prefix, suffix, delta, deltaLabel = 'vs. Vorwoche', icon, color = 'butter', trend, tilt, className, style, ...rest }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cx('pp-stat', className)} style={{ ...vars({ '--r': deg(tilt) }), ...style }} {...rest}>
      <div className="pp-stat-head">
        <span className="pp-caps">{label}</span>
        {icon && <span className={cx('pp-stat-icon', `pp-c-${color}`)}><Icon name={icon} size={20} /></span>}
      </div>
      <div className="pp-stat-value pp-display">
        {typeof value === 'number' ? <CountUp value={value} prefix={prefix} suffix={suffix} decimals={Number.isInteger(value) ? 0 : 1} /> : `${prefix ?? ''}${value}${suffix ?? ''}`}
      </div>
      <div className="pp-stat-foot">
        {delta !== undefined && (
          <span className={cx('pp-delta', up ? 'pp-delta-up' : 'pp-delta-down')}>
            <Icon name={up ? 'arrow-up' : 'arrow-down'} size={14} stroke={3} />{Math.abs(delta).toLocaleString('de-DE')}%
          </span>
        )}
        {delta !== undefined && <span className="pp-soft">{deltaLabel}</span>}
        {trend && <Sparkline values={trend} width={96} height={32} className="pp-stat-trend" />}
      </div>
    </div>
  );
}

export interface BarDatum { label: string; value: number; color?: string }

export interface BarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Bars. */
  data: BarDatum[];
  /** Chart height in px (vertical) or bar thickness (horizontal). @default 220 */
  height?: number;
  /** Lay bars out horizontally (good for long labels / rankings). */
  horizontal?: boolean;
  /** Format the value labels. */
  format?: (v: number) => string;
  /** Accessible summary. @default 'Balkendiagramm' */
  label?: string;
}

/** Chunky bars with ink outlines that grow in on mount. Colours cycle through the palette. */
export function BarChart({ data, height = 220, horizontal, format = fmt, label = 'Balkendiagramm', className, ...rest }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}`} className={cx('pp-bars', horizontal ? 'pp-bars-h' : 'pp-bars-v', className)} style={horizontal ? undefined : { height }} {...rest}>
      {data.map((d, i) => (
        <div key={d.label} className="pp-bar" style={vars({ '--v': d.value / max, '--c': colorVar(d.color ?? PALETTE[i % PALETTE.length]!), '--i': i })}>
          <span className="pp-bar-fill"><span className="pp-bar-value pp-hand">{format(d.value)}</span></span>
          <span className="pp-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export interface LineSeries { name: string; values: number[]; color?: string }

export interface LineChartProps extends HTMLAttributes<HTMLDivElement> {
  /** One or more series with the same length as `labels`. */
  series: LineSeries[];
  /** X axis labels. */
  labels: string[];
  /** Height in px. @default 240 */
  height?: number;
  /** Fill the area under the first series. @default true */
  area?: boolean;
  /** Show the legend. @default true when there are 2+ series */
  legend?: boolean;
  /** Accessible summary. @default 'Liniendiagramm' */
  label?: string;
}

/** Line chart with dashed grid, drawn in like a pen stroke. Scales to its container width. */
export function LineChart({ series, labels, height = 240, area = true, legend, label = 'Liniendiagramm', className, ...rest }: LineChartProps) {
  const W = 600;
  const H = height;
  const pad = { l: 44, r: 12, t: 16, b: 30 };
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all) * 1.1 || 1;
  const min = Math.min(0, ...all);
  const x = (i: number) => pad.l + (i / Math.max(1, labels.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - ((v - min) / (max - min)) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + (max - min) * t);
  const every = Math.ceil(labels.length / 8);
  return (
    <div className={cx('pp-linechart', className)} {...rest}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="pp-grid-line" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="pp-axis">{Math.round(t).toLocaleString('de-DE')}</text>
          </g>
        ))}
        {labels.map((l, i) => i % every === 0 && <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" className="pp-axis">{l}</text>)}
        {series.map((s, si) => {
          const c = colorVar(s.color ?? PALETTE[si % PALETTE.length]!);
          const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
          return (
            <g key={s.name}>
              {area && si === 0 && <path d={`${d} L${x(s.values.length - 1)} ${y(min)} L${x(0)} ${y(min)} Z`} fill={c} opacity=".22" className="pp-fade" />}
              <path d={d} pathLength={1} className="pp-draw" fill="none" stroke="var(--pp-ink)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={d} pathLength={1} className="pp-draw" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </svg>
      {(legend ?? series.length > 1) && (
        <ul className="pp-legend">
          {series.map((s, si) => <li key={s.name}><i style={{ background: colorVar(s.color ?? PALETTE[si % PALETTE.length]!) }} />{s.name}</li>)}
        </ul>
      )}
    </div>
  );
}

export interface DonutChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Slices. */
  data: BarDatum[];
  /** Diameter in px. @default 200 */
  size?: number;
  /** Big text in the middle (defaults to the total). */
  center?: ReactNode;
  /** Small text under the center value. */
  centerLabel?: ReactNode;
  /** Show the legend with percentages. @default true */
  legend?: boolean;
}

/** Donut chart in pastel slices with a legend. Slices sweep in on mount. */
export function DonutChart({ data, size = 200, center, centerLabel = 'gesamt', legend = true, className, ...rest }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 15.915;
  let acc = 0;
  return (
    <div className={cx('pp-donut', className)} {...rest}>
      <div className="pp-donut-chart" style={{ width: size, height: size }}>
        <svg viewBox="0 0 42 42" role="img" aria-label={data.map((d) => `${d.label} ${Math.round((d.value / total) * 100)}%`).join(', ')}>
          <circle cx="21" cy="21" r={R} fill="none" stroke="var(--pp-ink)" strokeWidth="9.4" />
          {data.map((d, i) => {
            const pct = (d.value / total) * 100;
            const off = 25 - acc;
            acc += pct;
            return (
              <circle key={d.label} cx="21" cy="21" r={R} fill="none" stroke={colorVar(d.color ?? PALETTE[i % PALETTE.length]!)} strokeWidth="7.4"
                strokeDasharray={`${Math.max(0, pct - 0.6)} ${100 - Math.max(0, pct - 0.6)}`} strokeDashoffset={off} className="pp-donut-seg" style={vars({ '--i': i })} />
            );
          })}
        </svg>
        <div className="pp-donut-center"><b className="pp-display">{center ?? fmt(total)}</b><span className="pp-hand">{centerLabel}</span></div>
      </div>
      {legend && (
        <ul className="pp-legend pp-legend-col">
          {data.map((d, i) => (
            <li key={d.label}><i style={{ background: colorVar(d.color ?? PALETTE[i % PALETTE.length]!) }} />{d.label}<b>{Math.round((d.value / total) * 100)}%</b></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  /** 0 - 100. */
  value: number;
  /** Diameter. @default 'md' */
  size?: Size;
  /** Ring colour. @default 'mint' */
  color?: PaperColor;
  /** Text under the percentage. */
  label?: ReactNode;
}

/** Circular progress for goals and quotas. */
export function ProgressRing({ value, size = 'md', color = 'mint', label, className, ...rest }: ProgressRingProps) {
  const px = size === 'sm' ? 72 : size === 'lg' ? 160 : 112;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cx('pp-ring', `pp-ring-${size}`, className)} style={{ width: px, height: px }} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} {...rest}>
      <svg viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.915" fill="var(--pp-paper)" stroke="var(--pp-ink)" strokeWidth="8" />
        <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--pp-paper)" strokeWidth="5" />
        <circle cx="21" cy="21" r="15.915" fill="none" stroke={`var(--pp-${color})`} strokeWidth="5" strokeDasharray={`${v} ${100 - v}`} strokeDashoffset="25" strokeLinecap="round" className="pp-ring-fill" style={vars({ '--v': v })} />
      </svg>
      <div className="pp-ring-center"><b className="pp-display">{Math.round(v)}%</b>{label && <span>{label}</span>}</div>
    </div>
  );
}

export interface Column<T> {
  /** Key in the row object (also used for sorting). */
  key: keyof T & string;
  /** Header text. */
  header: ReactNode;
  /** Custom cell renderer. */
  render?: (row: T) => ReactNode;
  /** Allow sorting by this column. */
  sortable?: boolean;
  /** Text alignment. */
  align?: 'left' | 'right' | 'center';
  /** Fixed width, e.g. '120px'. */
  width?: string;
}

export interface DataTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  /** Column definitions. */
  columns: Column<T>[];
  /** Rows. */
  rows: T[];
  /** Unique key per row. @default row index */
  rowKey?: (row: T) => string | number;
  /** Row click handler (makes rows look clickable). */
  onRowClick?: (row: T) => void;
  /** Shown when rows is empty. @default 'Noch nichts da.' */
  empty?: ReactNode;
  /** Compact rows. */
  dense?: boolean;
}

/** Sortable table on paper with a zebra-striped body and a sticky header. */
export function DataTable<T extends Record<string, unknown>>({ columns, rows, rowKey, onRowClick, empty = 'Noch nichts da.', dense, className, ...rest }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'de')) * sort.dir;
    });
  }, [rows, sort]);
  const toggle = (key: string) => setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));
  return (
    <div className={cx('pp-table-wrap', dense && 'pp-table-dense', className)} {...rest}>
      <table className="pp-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: c.align, width: c.width }} aria-sort={sort?.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                {c.sortable ? (
                  <button type="button" onClick={() => toggle(c.key)}>
                    {c.header}
                    <Icon name={sort?.key === c.key ? (sort.dir === 1 ? 'arrow-up' : 'arrow-down') : 'chevron-down'} size={13} stroke={3} className={sort?.key === c.key ? undefined : 'pp-soft'} />
                  </button>
                ) : c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && <tr><td colSpan={columns.length} className="pp-table-empty pp-hand">{empty}</td></tr>}
          {sorted.map((r, i) => (
            <tr key={rowKey ? rowKey(r) : i} onClick={onRowClick && (() => onRowClick(r))} className={onRowClick ? 'pp-row-click' : undefined}>
              {columns.map((c) => <td key={c.key} style={{ textAlign: c.align }}>{c.render ? c.render(r) : String(r[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Full name - used for initials, colour and alt text. */
  name: string;
  /** Image URL. */
  src?: string;
  /** Size. @default 'md' */
  size?: Size | number;
  /** Online status dot. */
  status?: 'online' | 'away' | 'offline';
  /** Colour override (otherwise derived from the name). */
  color?: PaperColor;
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

/** Round avatar with image or initials on a pastel colour picked from the name. */
export function Avatar({ name, src, size = 'md', status, color, className, style, ...rest }: AvatarProps) {
  const px = typeof size === 'number' ? size : size === 'sm' ? 32 : size === 'lg' ? 64 : 44;
  const c = color ?? PALETTE[hash(name) % PALETTE.length]!;
  return (
    <span className={cx('pp-avatar', `pp-c-${c}`, className)} style={{ width: px, height: px, fontSize: px * 0.38, ...style }} title={name} {...rest}>
      {src ? <img src={src} alt={name} /> : <span aria-label={name} role="img">{initials(name)}</span>}
      {status && <i className={cx('pp-avatar-status', `pp-status-${status}`)} aria-label={status} />}
    </span>
  );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** People. */
  people: Array<{ name: string; src?: string }>;
  /** Max avatars shown before "+n". @default 4 */
  max?: number;
  /** Avatar size. @default 'md' */
  size?: Size;
}

/** Overlapping avatars with a "+n" chip. */
export function AvatarGroup({ people, max = 4, size = 'md', className, ...rest }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const more = people.length - shown.length;
  return (
    <div className={cx('pp-avatars', className)} {...rest}>
      {shown.map((p) => <Avatar key={p.name} {...p} size={size} />)}
      {more > 0 && <Avatar name={`+ ${more}`} size={size} color="paper" className="pp-avatar-more" />}
    </div>
  );
}

export interface LeaderboardProps extends HTMLAttributes<HTMLOListElement> {
  /** Entries, already sorted. */
  items: Array<{ name: string; value: number | string; src?: string; meta?: ReactNode }>;
  /** Unit after the value. */
  unit?: string;
}

/** Ranked list - top three get gold, silver and bronze stickers. */
export function Leaderboard({ items, unit, className, ...rest }: LeaderboardProps) {
  return (
    <ol className={cx('pp-leader', className)} {...rest}>
      {items.map((it, i) => (
        <li key={it.name} className={i < 3 ? `pp-leader-top pp-leader-${i + 1}` : undefined}>
          <span className="pp-leader-rank pp-display">{i + 1}</span>
          <Avatar name={it.name} src={it.src} size="sm" />
          <span className="pp-leader-name"><b>{it.name}</b>{it.meta && <small>{it.meta}</small>}</span>
          <span className="pp-leader-value pp-display">{typeof it.value === 'number' ? fmt(it.value) : it.value}{unit && <small> {unit}</small>}</span>
        </li>
      ))}
    </ol>
  );
}

export interface ActivityItem {
  who: string;
  /** What happened, e.g. "hat kommentiert". */
  action: ReactNode;
  /** Object of the action, shown bold. */
  target?: ReactNode;
  time: ReactNode;
  icon?: IconName;
  color?: PaperColor;
}

export interface ActivityFeedProps extends HTMLAttributes<HTMLUListElement> {
  items: ActivityItem[];
}

/** "Who did what, when" list for dashboards. */
export function ActivityFeed({ items, className, ...rest }: ActivityFeedProps) {
  return (
    <ul className={cx('pp-feed', className)} {...rest}>
      {items.map((it, i) => (
        <li key={i}>
          <span className="pp-feed-avatar">
            <Avatar name={it.who} size="sm" />
            {it.icon && <span className={cx('pp-feed-icon', `pp-c-${it.color ?? 'butter'}`)}><Icon name={it.icon} size={11} stroke={3} /></span>}
          </span>
          <p><b>{it.who}</b> {it.action} {it.target && <b>{it.target}</b>}</p>
          <time>{it.time}</time>
        </li>
      ))}
    </ul>
  );
}

export interface HeatmapProps extends HTMLAttributes<HTMLDivElement> {
  /** Values per day, oldest first. Rendered in columns of 7 (weeks). */
  values: number[];
  /** Colour scale. @default 'pink' */
  color?: PaperColor;
  /** Label for the legend. @default 'weniger / mehr' */
  legend?: [string, string];
  /** Cell size in px. @default 14 */
  cell?: number;
}

/** Contribution-style calendar heatmap (5 levels). */
export function Heatmap({ values, color = 'pink', legend = ['weniger', 'mehr'], cell = 14, className, style, ...rest }: HeatmapProps) {
  const max = Math.max(...values, 1);
  const level = (v: number) => (v <= 0 ? 0 : Math.min(4, Math.ceil((v / max) * 4)));
  return (
    <div className={cx('pp-heatmap', `pp-c-${color}`, className)} style={{ ...vars({ '--cell': `${cell}px` }), ...style }} {...rest}>
      <div className="pp-heatmap-grid" role="img" aria-label={`Aktivität über ${values.length} Tage`}>
        {values.map((v, i) => <i key={i} className={`pp-l${level(v)}`} title={String(v)} />)}
      </div>
      <div className="pp-heatmap-legend"><span>{legend[0]}</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} className={`pp-l${l}`} />)}<span>{legend[1]}</span></div>
    </div>
  );
}
