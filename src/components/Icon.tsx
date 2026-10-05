// Made by Jack (iamjustjack.de)
import type { SVGProps } from 'react';

const ICONS = {
  heart: 'F:M12 20.5c-.4 0-7.8-4.6-9.4-9.4C1.6 7.9 3.6 4.5 7 4.5c2.2 0 3.9 1.3 5 3 1.1-1.7 2.8-3 5-3 3.4 0 5.4 3.4 4.4 6.6-1.6 4.8-9 9.4-9.4 9.4z',
  sparkle: 'F:M12 1c.6 5.6 2.2 9.3 11 11-8.8 1.7-10.4 5.4-11 11-.6-5.6-2.2-9.3-11-11 8.8-1.7 10.4-5.4 11-11z',
  star: 'F:m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z',
  'heart-outline': 'M12 20.5c-.4 0-7.8-4.6-9.4-9.4C1.6 7.9 3.6 4.5 7 4.5c2.2 0 3.9 1.3 5 3 1.1-1.7 2.8-3 5-3 3.4 0 5.4 3.4 4.4 6.6-1.6 4.8-9 9.4-9.4 9.4z',
  'star-outline': 'm12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z',
  scissors: 'M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12',
  check: 'm4.5 12.5 5 5L20 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  search: 'M16.5 16.5 21 21M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z',
  menu: 'M4 6.5h16M4 12h16M4 17.5h16',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.8c1.9.8 3.2 2.6 3.5 5.2',
  home: 'M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5',
  chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
  pie: 'M12 3a9 9 0 1 0 9 9h-9zM15 3.5a8 8 0 0 1 5.5 5.5H15z',
  trend: 'm3.5 16.5 6-6 4 4 7-7.5M15.5 7h5v5',
  settings: 'M10.11 4.95L10.44 2.12L13.56 2.12L13.89 4.95A7.3 7.3 0 0 1 15.65 5.68L17.88 3.91L20.09 6.12L18.32 8.35A7.3 7.3 0 0 1 19.05 10.11L21.88 10.44L21.88 13.56L19.05 13.89A7.3 7.3 0 0 1 18.32 15.65L20.09 17.88L17.88 20.09L15.65 18.32A7.3 7.3 0 0 1 13.89 19.05L13.56 21.88L10.44 21.88L10.11 19.05A7.3 7.3 0 0 1 8.35 18.32L6.12 20.09L3.91 17.88L5.68 15.65A7.3 7.3 0 0 1 4.95 13.89L2.12 13.56L2.12 10.44L4.95 10.11A7.3 7.3 0 0 1 5.68 8.35L3.91 6.12L6.12 3.91L8.35 5.68A7.3 7.3 0 0 1 10.11 4.95zM15.2 12a3.2 3.2 0 1 1-6.4 0 3.2 3.2 0 0 1 6.4 0z',
  mail: 'M3 5h18v14H3zM3.5 6.5l8.5 6.5 8.5-6.5',
  chat: 'M4 5h16v11H9l-5 4z',
  send: 'M21 3 10 14M21 3l-7 18-4-7-7-4z',
  lock: 'M6 11h12v9.5H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3zM8.8 12.2l2.3 2.3 4.2-4.6',
  pen: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4',
  trash: 'M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5',
  calendar: 'M4 6h16v14H4zM4 10.5h16M8.5 3.5v4M15.5 3.5v4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  download: 'M12 4v12M7 11l5 5 5-5M4 16v4h16v-4',
  link: 'M10 14a4.5 4.5 0 0 0 6.4.4l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2M14 10a4.5 4.5 0 0 0-6.4-.4l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  flag: 'M5 21V4M5 4.5h12l-2.5 4 2.5 4H5',
  fire: 'M12 21c-4 0-7-2.8-7-6.6 0-3.4 2.5-5.4 3.8-8.4.6 1.8 1.6 3 2.7 3.6C11.8 6.4 13.3 3.8 15.8 3c-.5 3 1.2 5 2.2 6.6.8 1.3 1.1 2.8 1 4.3-.1 3.9-3 7.1-7 7.1z',
  'thumbs-up': 'M7.5 10.5V20H4v-9.5zM7.5 10.5 11 3.5c1.6 0 2.7 1.3 2.4 2.9L12.8 9.5H19a1.8 1.8 0 0 1 1.8 2.1l-1.2 6.8A2 2 0 0 1 17.6 20H7.5',
  bookmark: 'M6 3.5h12V21l-6-4.5L6 21z',
  filter: 'M3.5 5h17l-6.5 8v6l-4 2v-8z',
  grid: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  list: 'M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01',
  logout: 'M15 4h4.5v16H15M10 16.5 14.5 12 10 7.5M14.5 12H3.5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.5h.01',
  warning: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17.5h.01',
  'arrow-right': 'M4 12h16M14 6l6 6-6 6',
  'arrow-left': 'M20 12H4M10 6l-6 6 6 6',
  'arrow-up': 'M12 20V4M6 10l6-6 6 6',
  'arrow-down': 'M12 4v16M6 14l6 6 6-6',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-up': 'm6 15 6-6 6 6',
  'chevron-left': 'm15 6-6 6 6 6',
  'chevron-right': 'm9 6 6 6-6 6',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  copy: 'M8 8h12v12H8zM16 8V4H4v12h4',
  stack: 'M3.41 7.66L16.33 6.30L17.69 19.23L4.76 20.59zM7.55 3.50L20.50 4.63L19.36 17.58L6.41 16.45z',
  image: 'M3.5 4.5h17v15h-17zM3.5 16l5-5 4 4 3-3 5 5M15.5 9.5h.01',
  file: 'M6 3h8l5 5v13H6zM14 3v5h5',
  folder: 'M3 6h6.5l2 2.5H21V19H3z',
  code: 'm8 7-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15',
  terminal: 'M3.5 4.5h17v15h-17zM7 9.5l3 2.5-3 2.5M12 15h5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
  rocket: 'M14.5 4.5c2.5-1 4.8-1.2 6-1 .2 1.2 0 3.5-1 6L13 16l-5-5zM8 11l-4 .5L6.5 8H10M13 16l-.5 4 3.5-2.5V14M6.5 15.5 4 20l4.5-2.5',
  gift: 'M4 9h16v4H4zM5.5 13v7.5h13V13M12 9v11.5M12 9C10 5 6.5 5.5 7 7.5 7.4 9 12 9 12 9zM12 9c2-4 5.5-3.5 5-1.5-.4 1.5-5 1.5-5 1.5z',
  coffee: 'M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10.5h1.5a2.5 2.5 0 0 1 0 5H16.5M8 3.5v2.5M12 3.5v2.5',
  music: 'M9 18V5.5l11-2V16M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  refresh: 'M20 5v5h-5M4 19v-5h5M19.2 10A7.5 7.5 0 0 0 5.6 7.2M4.8 14a7.5 7.5 0 0 0 13.6 2.8',
  zap: 'M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14.5c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01',
  instagram: 'M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM16.2 12a4.2 4.2 0 1 1-8.4 0 4.2 4.2 0 0 1 8.4 0zM17.3 6.7h.01',
  tiktok: 'M14 3v12.5M14 15.5a4.5 4.5 0 1 1-4.5-4.5M14 3c.1 2.7 2.2 4.8 5.5 5',
  discord: 'M8.2 5.3c2.4-.5 5.2-.5 7.6 0 1.7.4 2.9.9 3.7 1.4 1.5 2.8 2.3 6 2.1 9.6-1.4 1.1-3 1.8-4.7 2.2l-1.1-1.8M8.2 5.3c-1.7.4-2.9.9-3.7 1.4C3 9.5 2.2 12.7 2.4 16.3c1.4 1.1 3 1.8 4.7 2.2l1.1-1.8M7.8 15.5c2.6 1 5.8 1 8.4 0M9 10.3v2.2M15 10.3v2.2',
  signal: 'M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z',
  github: 'M9 19c-4 1.3-4-2-5.5-2.5M14.5 21v-3.4c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.7 4.7 0 0 0-1.3-3.3 4.3 4.3 0 0 0-.1-3.3s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.1 0C6.2 2.7 5.2 3 5.2 3a4.3 4.3 0 0 0-.1 3.3A4.7 4.7 0 0 0 3.8 9.6c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  youtube: 'M2.8 7.5c.2-1.4 1.2-2.4 2.6-2.5C7.5 4.8 9.7 4.7 12 4.7s4.5.1 6.6.3c1.4.1 2.4 1.1 2.6 2.5.2 1.5.3 3 .3 4.5s-.1 3-.3 4.5c-.2 1.4-1.2 2.4-2.6 2.5-2.1.2-4.3.3-6.6.3s-4.5-.1-6.6-.3c-1.4-.1-2.4-1.1-2.6-2.5-.2-1.5-.3-3-.3-4.5s.1-3 .3-4.5zM10 9v6l5-3z',
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'stroke'> {
  /** Which icon to draw. */
  name: IconName;
  /** Width and height in px. @default 24 */
  size?: number;
  /** Stroke width for line icons. @default 2.2 */
  stroke?: number;
  /** Accessible label. Without it the icon is decorative (aria-hidden). */
  label?: string;
}

/** Inline SVG icon from the Paper Pop set. Inherits colour from `color`. */
export function Icon({ name, size = 24, stroke = 2.2, label, ...rest }: IconProps) {
  const d: string = ICONS[name];
  const filled = d.startsWith('F:');
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <path
        d={filled ? d.slice(2) : d}
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The 9x8 pixel heart from the DVN Network days. `color` fills it. */
export function PixelHeart({ size = 36, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg viewBox="0 0 9 8" width={size} height={(size * 8) / 9} shapeRendering="crispEdges" aria-hidden="true" {...rest}>
      <path fill="#2A1B3D" d="M1 0h2v1H1zM6 0h2v1H6zM0 1h1v3H0zM3 1h1v1H3zM5 1h1v1H5zM8 1h1v3H8zM4 2h1v1H4zM1 4h1v1H1zM7 4h1v1H7zM2 5h1v1H2zM6 5h1v1H6zM3 6h1v1H3zM5 6h1v1H5zM4 7h1v1H4z" />
      <path fill="currentColor" d="M1 1h2v1H1zM6 1h2v1H6zM1 2h3v1H1zM5 2h3v1H5zM1 3h7v1H1zM2 4h5v1H2zM3 5h3v1H3zM4 6h1v1H4z" />
      <path fill="#fff" d="M1 1h1v1H1z" />
    </svg>
  );
}
