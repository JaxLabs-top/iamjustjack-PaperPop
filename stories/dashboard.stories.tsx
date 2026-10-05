// Made by Jack (iamjustjack.de)
import {
  ActivityFeed, Avatar, AvatarGroup, Badge, BarChart, CountUp, DataTable, DonutChart, Heatmap, Leaderboard, LineChart,
  ProgressRing, Sparkline, StatCard,
} from '../src';
import { story } from './types';

export default [
  story({
    name: 'StatCard',
    category: 'Dashboard',
    description: 'KPI card: label, counting number, delta arrow, icon and sparkline.',
    width: 900,
    animation: { duration: 1500 },
    example: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
        <StatCard label="Besucher heute" value={1284} delta={12.5} icon="users" trend={[4, 6, 5, 8, 7, 11, 13]} />
        <StatCard label="Umsatz" value={3920} suffix=" €" delta={-3.1} icon="trend" color="mint" />
        <StatCard label="Conversion" value={4.2} suffix="%" delta={0.8} icon="zap" color="pink" tilt={-1} />
      </div>
    ),
  }),
  story({
    name: 'Sparkline',
    category: 'Dashboard',
    description: 'Tiny inline trend line for cards and tables.',
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'center' }}>
        <Sparkline values={[3, 5, 4, 8, 6, 9, 12]} />
        <Sparkline values={[12, 9, 10, 7, 8, 4, 3]} color="pink" />
        <Sparkline values={[5, 5, 6, 5, 7, 6, 8]} color="sky" width={160} area={false} />
      </div>
    ),
  }),
  story({
    name: 'BarChart',
    category: 'Dashboard',
    description: 'Chunky outlined bars that grow in - vertical or horizontal.',
    width: 820,
    animation: { duration: 1300 },
    example: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, alignItems: 'end' }}>
        <BarChart data={[{ label: 'Mo', value: 120 }, { label: 'Di', value: 180 }, { label: 'Mi', value: 90 }, { label: 'Do', value: 240 }, { label: 'Fr', value: 200 }]} />
        <BarChart horizontal data={[{ label: 'Chrome', value: 62 }, { label: 'Safari', value: 24 }, { label: 'Firefox', value: 9 }, { label: 'Andere', value: 5 }]} format={(v) => `${v}%`} />
      </div>
    ),
  }),
  story({
    name: 'LineChart',
    category: 'Dashboard',
    description: 'Line chart with dashed grid, drawn in like a pen stroke; multiple series with legend.',
    width: 760,
    animation: { duration: 1700 },
    example: () => (
      <LineChart
        labels={['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug']}
        series={[
          { name: 'Besucher', values: [320, 410, 380, 520, 610, 580, 720, 860] },
          { name: 'Anmeldungen', values: [40, 60, 55, 90, 120, 110, 160, 210], color: 'sky' },
        ]}
      />
    ),
  }),
  story({
    name: 'DonutChart',
    category: 'Dashboard',
    description: 'Donut chart in pastel slices with center value and legend.',
    width: 560,
    animation: { duration: 1400 },
    example: () => (
      <DonutChart center="1.2k" centerLabel="Besuche" data={[
        { label: 'Direkt', value: 480 }, { label: 'Suche', value: 360 }, { label: 'Social', value: 240 }, { label: 'Links', value: 120 },
      ]} />
    ),
  }),
  story({
    name: 'ProgressRing',
    category: 'Dashboard',
    description: 'Circular progress for goals and quotas in three sizes.',
    animation: { duration: 1400 },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'center' }}>
        <ProgressRing value={25} size="sm" color="pink" />
        <ProgressRing value={68} label="Ziel" />
        <ProgressRing value={92} size="lg" color="sky" label="Speicher" />
      </div>
    ),
  }),
  story({
    name: 'DataTable',
    category: 'Dashboard',
    description: 'Sortable table with sticky header, zebra rows, custom cells and an empty state.',
    width: 820,
    example: () => (
      <DataTable
        rows={[
          { name: 'Boby', plan: 'Pro', posts: 342, status: 'aktiv' },
          { name: 'Kim', plan: 'Free', posts: 128, status: 'aktiv' },
          { name: 'Alex', plan: 'Team', posts: 57, status: 'pausiert' },
        ]}
        columns={[
          { key: 'name', header: 'Name', sortable: true, render: (r) => <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}><Avatar name={r.name} size="sm" />{r.name}</span> },
          { key: 'plan', header: 'Plan', sortable: true },
          { key: 'posts', header: 'Beiträge', sortable: true, align: 'right' },
          { key: 'status', header: 'Status', render: (r) => <Badge color={r.status === 'aktiv' ? 'mint' : 'butter'}>{r.status}</Badge> },
        ]}
      />
    ),
  }),
  story({
    name: 'Avatar',
    category: 'Dashboard',
    description: 'Round avatar with image or initials (colour from the name) and status dot, plus overlapping groups.',
    exports: ['Avatar', 'AvatarGroup'],
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'center' }}>
        <Avatar name="Jack Feuchte" size="lg" status="online" />
        <Avatar name="Kim Berg" status="away" />
        <Avatar name="Alex" size="sm" status="offline" />
        <AvatarGroup people={[{ name: 'Kim' }, { name: 'Boby' }, { name: 'Alex' }, { name: 'Sam' }, { name: 'Lou' }, { name: 'Mo' }]} max={4} />
      </div>
    ),
  }),
  story({
    name: 'Leaderboard',
    category: 'Dashboard',
    description: 'Ranked list - top three get gold, silver and bronze.',
    width: 520,
    example: () => (
      <Leaderboard unit="XP" items={[
        { name: 'Boby', value: 12840, meta: 'Level 42' },
        { name: 'Kim', value: 11020, meta: 'Level 39' },
        { name: 'Alex', value: 9870, meta: 'Level 35' },
        { name: 'Sam', value: 7200, meta: 'Level 28' },
      ]} />
    ),
  }),
  story({
    name: 'ActivityFeed',
    category: 'Dashboard',
    description: '"Who did what, when" list with small action icons.',
    width: 560,
    example: () => (
      <ActivityFeed items={[
        { who: 'Kim', action: 'hat kommentiert in', target: 'Server-Update', time: 'vor 2 Min.', icon: 'chat', color: 'sky' },
        { who: 'Boby', action: 'gefällt', target: 'Neue Map', time: 'vor 1 Std.', icon: 'heart', color: 'pink' },
        { who: 'Alex', action: 'hat hochgeladen', target: 'screenshot.png', time: 'gestern', icon: 'upload', color: 'mint' },
      ]} />
    ),
  }),
  story({
    name: 'Heatmap',
    category: 'Dashboard',
    description: 'Contribution-style calendar heatmap with five levels.',
    width: 820,
    example: () => <Heatmap values={Array.from({ length: 26 * 7 }, (_, i) => Math.round(Math.abs(Math.sin(i * 1.7) * 6 + Math.cos(i / 9) * 4)) - 2)} />,
  }),
  story({
    name: 'CountUp',
    category: 'Dashboard',
    description: 'Number that counts up on mount or when the value changes.',
    width: 820,
    animation: { duration: 1400 },
    example: () => (
      <div className="pp-display" style={{ fontSize: 'clamp(32px, 8vw, 52px)', display: 'flex', flexWrap: 'wrap', gap: '10px 40px', whiteSpace: 'nowrap' }}>
        <CountUp value={110} suffix="+" />
        <CountUp value={98.6} decimals={1} suffix="%" />
        <CountUp value={4200} prefix="€ " />
      </div>
    ),
  }),
];
