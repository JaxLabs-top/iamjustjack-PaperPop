<!-- Made by Jack (iamjustjack.de) -->
# Page recipes

Skeletons for typical pages. Every component links to its doc in `docs/components/<Name>.md`.
Rule of thumb: **Paper** (torn) for decorative sheets and big surfaces, **Card** (ink border + hard shadow) for UI.

## landing

```tsx
import { Button, Container, CtaBanner, FeatureGrid, Footer, Hero, Marquee, Navbar, PricingTable, Section, Steps, Testimonial, Accordion } from 'paperpop';

export default function Landing() {
  return (
    <>
      <Container><Navbar brand="name" links={[{ label: 'features', href: '#features' }, { label: 'preise', href: '#pricing' }, { label: 'faq', href: '#faq' }]} /></Container>
      <Container as="main">
        <Hero kicker="hi ♥" title={<>Große<br />Idee<em>.</em></>} lead="Ein Satz, der erklärt, worum es geht." actions={<Button>Loslegen</Button>} media="/img/hero.jpg" />
        <Marquee items={['schnell', 'schön', 'selbst gehostet']} />
        <Section id="features" kicker="warum" title="Features"><FeatureGrid items={[/* { icon, title, text } */]} /></Section>
        <Section kicker="so geht's" title="In 4 Schritten"><Steps items={[/* { title, text } */]} /></Section>
        <Section id="pricing" title="Preise"><PricingTable plans={[/* Plan */]} /></Section>
        <Section title="Stimmen"><Testimonial quote="…" name="Kim" role="Kundin" /></Section>
        <Section id="faq" title="FAQ"><Accordion items={[/* { id, title, content } */]} /></Section>
        <CtaBanner title="Lust?" actions={<Button color="butter">Schreib mir</Button>} />
      </Container>
      <Footer brand="NAME" note="© 2026" links={[{ label: 'Impressum', href: '/imprint' }, { label: 'Datenschutz', href: '/privacy' }]} />
    </>
  );
}
```

## dashboard

```tsx
import { ActivityFeed, AppShell, Avatar, BarChart, Card, DataTable, DonutChart, Grid, LineChart, SearchInput, SegmentedControl, Sidebar, StatCard } from 'paperpop';

export default function Dashboard() {
  return (
    <AppShell
      sidebar={<Sidebar brand="studio" sections={[{ links: [{ label: 'Übersicht', href: '/dashboard', icon: 'home', active: true }, { label: 'Statistiken', href: '/stats', icon: 'chart' }] }]} />}
      topbar={<><h1 className="pp-display" style={{ fontSize: 30, flex: 1 }}>Übersicht</h1><SearchInput value="" onChange={() => {}} /><Avatar name="Jack" /></>}
    >
      <Grid cols={4} gap={20}>
        <StatCard label="Besucher" value={1284} delta={12} icon="users" trend={[3, 5, 4, 8]} />
        {/* more StatCards */}
      </Grid>
      <Grid cols={2} gap={24}>
        <Card title="Verlauf" actions={<SegmentedControl options={['7T', '30T']} value="7T" onChange={() => {}} />}><LineChart labels={[]} series={[]} /></Card>
        <Card title="Quellen"><DonutChart data={[]} /></Card>
        <Card title="Pro Tag"><BarChart data={[]} /></Card>
        <Card title="Aktivität"><ActivityFeed items={[]} /></Card>
      </Grid>
      <DataTable columns={[]} rows={[]} />
    </AppShell>
  );
}
```

## forum

```tsx
import { Breadcrumbs, Button, CategoryCard, Comment, Composer, Container, Navbar, Pagination, Post, SearchInput, Section, SegmentedControl, ThreadCard, UserCard } from 'paperpop';

// Board overview: CategoryCard list. Thread list: ThreadCard + Pagination. Thread page: Post + Comment tree + Composer.
export default function Forum() {
  return (
    <Container>
      <Navbar brand="forum" links={[{ label: 'neueste', href: '/forum', active: true }]} actions={<Button size="sm">Neues Thema</Button>} />
      <Section space="sm" title="Neueste Themen" aside={<SearchInput value="" onChange={() => {}} />}>
        <div style={{ display: 'grid', gap: 16 }}>
          <ThreadCard title="…" href="/forum/t/1" author="Kim" time="vor 2 Std." score={12} replies={4} category={{ label: 'Hilfe' }} />
        </div>
        <Pagination page={1} pages={10} onChange={() => {}} />
      </Section>
    </Container>
  );
}
```

## app

```tsx
import { AppShell, ChatThread, Checklist, Drawer, KanbanBoard, MiniCalendar, Sidebar } from 'paperpop';
// Tools/productivity: AppShell + Sidebar, then KanbanBoard / ChatThread / MiniCalendar / Checklist in Cards.
```

## links (link-in-bio)

```tsx
import { Heading, Polaroid, SocialLinks, Card } from 'paperpop';
// One narrow column (max 560px): Polaroid photo, Heading with the name, short bio, then a list of
// clickable <Card hover as="a" href=…> rows with icon + title + subtitle, SocialLinks at the bottom.
```

## legal (Impressum / Datenschutz)

```tsx
import { Container, Heading, Paper, Footer } from 'paperpop';
// <Container max={900}><Paper color="butter" edge="big-2" tilt={-1}><Heading level={1}>Impressum</Heading></Paper>
// <Paper edge="big-3" tilt={0.4}> … h2 + p … </Paper></Container>
```
