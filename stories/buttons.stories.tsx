// Made by Jack (iamjustjack.de)
import { useState } from 'react';
import { Button, CopyButton, Fab, IconButton, LikeButton, Pill, SegmentedControl, SocialLinks } from '../src';
import { story } from './types';

export default [
  story({
    name: 'Button',
    category: 'Buttons',
    description: 'The chunky, slightly crooked main button with a hard ink shadow. Colours, sizes, icons, loading, link mode.',
    width: 780,
    animation: { steps: [{ wait: 200 }, { hover: '.pp-btn' }, { wait: 500 }, { leave: true }, { wait: 400 }] },
    example: () => (
      <div style={{ display: 'grid', gap: 26 }}>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button>Sag Hallo ♥</Button>
          <Button color="butter" icon="sparkle">Mit Icon</Button>
          <Button color="mint" iconRight="arrow-right">Weiter</Button>
          <Button color="ink">Dunkel</Button>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="sm" color="sky">Klein</Button>
          <Button size="lg" color="lilac" tilt={2}>Groß</Button>
          <Button loading color="pink">Fliegt los …</Button>
          <Button href="#" color="paper" tilt={0}>Als Link</Button>
          <Button disabled>Deaktiviert</Button>
        </div>
      </div>
    ),
  }),
  story({
    name: 'Pill',
    category: 'Buttons',
    description: 'Outlined rounded secondary button for navigation, filters and secondary actions.',
    animation: { steps: [{ wait: 200 }, { hover: '.pp-pill:nth-child(2)' }, { wait: 500 }, { leave: true }, { wait: 400 }] },
    example: () => (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill href="#" active>der name</Pill>
        <Pill href="#">projekte</Pill>
        <Pill icon="filter" color="mint">Filter</Pill>
        <Pill small color="butter">klein</Pill>
        <Pill disabled>aus</Pill>
      </div>
    ),
  }),
  story({
    name: 'IconButton',
    category: 'Buttons',
    description: 'Round icon-only button with an optional counter badge.',
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
        <IconButton icon="bell" label="Benachrichtigungen" badge={3} />
        <IconButton icon="heart" label="Merken" color="pink" />
        <IconButton icon="settings" label="Einstellungen" color="butter" size="lg" />
        <IconButton icon="search" label="Suchen" size="sm" color="mint" />
        <IconButton icon="plus" label="Neu" color="ink" />
      </div>
    ),
  }),
  story({
    name: 'SegmentedControl',
    category: 'Buttons',
    description: 'Connected toggle buttons for switching views (Tag / Woche / Monat).',
    animation: { steps: [{ wait: 300 }, { click: '[role=radio]:nth-child(2)' }, { wait: 500 }, { click: '[role=radio]:nth-child(3)' }, { wait: 500 }] },
    example: function Example() {
      const [range, setRange] = useState('Tag');
      return (
        <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
          <SegmentedControl label="Zeitraum" options={['Tag', 'Woche', 'Monat']} value={range} onChange={setRange} />
          <SegmentedControl label="Ansicht" value="grid" onChange={() => {}} options={[{ value: 'grid', label: 'Kacheln', icon: 'grid' }, { value: 'list', label: 'Liste', icon: 'list' }]} />
        </div>
      );
    },
  }),
  story({
    name: 'Fab',
    category: 'Buttons',
    description: 'Floating action button - a big round sticker that wiggles for attention.',
    animation: { duration: 3200, fps: 15 },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'center' }}>
        <Fab label="Neuer Beitrag" hint />
        <Fab icon="chat" label="Chat öffnen" color="pink" />
      </div>
    ),
  }),
  story({
    name: 'CopyButton',
    category: 'Buttons',
    description: 'Copies text to the clipboard and flips to "Kopiert!" for two seconds.',
    animation: { steps: [{ wait: 300 }, { click: 'button' }, { wait: 1000 }] },
    example: () => <CopyButton text="curl -L iamjustjack.de" label="Befehl kopieren" />,
  }),
  story({
    name: 'LikeButton',
    category: 'Buttons',
    description: 'Heart button: a pink wave floods the whole button and sparkles fly across it when liked.',
    height: 140,
    animation: { steps: [{ wait: 300 }, { click: 'button' }, { wait: 900 }] },
    example: () => (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 60 }}>
        <LikeButton count={41} />
      </div>
    ),
  }),
  story({
    name: 'SocialLinks',
    category: 'Buttons',
    description: 'Small chip links for social profiles and contact channels.',
    notes: 'Without `items` it shows Jack\'s real channels from links.iamjustjack.de (`JACK_SOCIALS`). Entries with `copy` instead of `href` copy a handle, e.g. a Discord name.',
    example: () => <SocialLinks />,
  }),
];
