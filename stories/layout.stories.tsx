// Made by Jack (iamjustjack.de)
import { Badge, Card, Container, Divider, Grid, IconButton, Paper, Pill, Section, Stack } from '../src';
import { story } from './types';

export default [
  story({
    name: 'Container',
    category: 'Layout',
    description: 'Centered page column (max 1280px) with a 16px gutter on phones.',
    width: 800,
    example: () => (
      <Container max={600} style={{ outline: '2px dashed var(--pp-pink)', padding: 20 }}>
        Alles, was hier drin ist, bleibt schön mittig und maximal 600px breit.
      </Container>
    ),
  }),
  story({
    name: 'Section',
    category: 'Layout',
    description: 'Page section with kicker, big heading, intro and an aside slot - consistent spacing.',
    width: 900,
    example: () => (
      <Section space="sm" kicker="was ich so baue" title="Projekte" intro="Ein paar Dinge, auf die ich stolz bin." aside={<Pill href="#all">alle ansehen →</Pill>} style={{ padding: 0 }}>
        <Paper color="mint" edge="card-1">Inhalt der Section</Paper>
      </Section>
    ),
  }),
  story({
    name: 'Stack',
    category: 'Layout',
    description: 'Flexbox helper for vertical or horizontal stacks with a gap.',
    example: () => (
      <Stack gap={20}>
        <Stack row gap={10}><Pill>eins</Pill><Pill>zwei</Pill><Pill>drei</Pill></Stack>
        <Stack row justify="between" align="center"><b>Links</b><Badge>rechts</Badge></Stack>
      </Stack>
    ),
  }),
  story({
    name: 'Grid',
    category: 'Layout',
    description: 'Responsive grid: fixed columns that collapse on small screens, or auto-fit by min width.',
    width: 800,
    example: () => (
      <Grid cols={3} gap={20}>
        {['pink', 'butter', 'mint', 'sky', 'lilac', 'paper'].map((c) => <Card key={c} color={c as 'pink'} pad={16}>{c}</Card>)}
      </Grid>
    ),
  }),
  story({
    name: 'Card',
    category: 'Layout',
    description: 'Ink-bordered card with a hard shadow for UI - title, eyebrow, actions, footer, hover lift.',
    width: 820,
    animation: { steps: [{ wait: 200 }, { hover: '.pp-card-hover' }, { wait: 500 }, { leave: true }, { wait: 400 }] },
    example: () => (
      <Grid cols={3} gap={24}>
        <Card eyebrow="Projekt" title="Paper Pop" actions={<IconButton icon="more" label="Mehr" size="sm" />} footer={<><span>vor 2 Tagen</span><Badge color="mint">live</Badge></>}>
          Persönliche Seite mit Admin-Inbox.
        </Card>
        <Card color="butter" tilt={-1.5} hover title="Klickbar" as="a" href="#">Hebt sich beim Drüberfahren.</Card>
        <Card color="ink" title="Dunkel">Für starke Akzente.</Card>
      </Grid>
    ),
  }),
  story({
    name: 'Divider',
    category: 'Layout',
    description: 'Horizontal divider: dashed, squiggly or a strip of washi tape, with optional label.',
    width: 640,
    example: () => (
      <div>
        <Divider label="oder" />
        <Divider variant="squiggle" />
        <Divider variant="washi" label="neues Kapitel" />
      </div>
    ),
  }),
];
