// Made by Jack (iamjustjack.de)
import { useEffect, useState } from 'react';
import {
  Confetti, Cutline, Doodle, Heading, Icon, ICON_NAMES, Kicker, LabelTags, Marker, Notebook, Paper, PaperPopEffects,
  PixelHeart, Polaroid, Stamp, Sticker, StickyNote, TitleTypewriter, TodoList, Washi,
} from '../src';
import { story } from './types';

export default [
  story({
    name: 'Paper',
    category: 'Foundations',
    description: 'Torn sheet of paper with a white rim - the core surface for heroes, sections and cards.',
    notes: 'Pick `edge` by size: `big-*` for large sheets, `card-*` for cards, `chip-*` for small bits, one-sided edges (`top-*`, `bottom-*`, `foot-*`, `l-*`, `r-*`) for strips that touch something. Colours: paper, pink, butter, mint, sky, lilac, notebook.',
    example: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 28 }}>
        <Paper color="lilac" edge="big-1" tilt={-1.5}><b className="pp-display">lilac</b><p>edge big-1</p></Paper>
        <Paper color="butter" edge="card-2" tilt={1}><b className="pp-display">butter</b><p>edge card-2</p></Paper>
        <Paper color="mint" edge="card-3" tilt={-0.5}><b className="pp-display">mint</b><p>edge card-3</p></Paper>
        <Paper color="sky" edge="card-4" tilt={0.8}><b className="pp-display">sky</b><p>edge card-4</p></Paper>
        <Paper color="pink" edge="card-5" tilt={-1}><b className="pp-display">pink</b><p>edge card-5</p></Paper>
        <Paper color="paper" edge="big-2" tilt={1.4}><b className="pp-display">paper</b><p>edge big-2</p></Paper>
      </div>
    ),
  }),
  story({
    name: 'Washi',
    category: 'Foundations',
    description: 'Strips of washi tape in several prints - stick them on polaroids, cards and notes.',
    width: 620,
    example: () => (
      <div style={{ display: 'grid', gap: 22, justifyItems: 'start' }}>
        <Washi inline pattern="rainbow" width={240} tilt={-2} />
        <Washi inline pattern="pink" width={200} tilt={1.5} edge="lr-2" />
        <Washi inline pattern="dots" width={260} tilt={-1} />
        <Washi inline pattern="stripes" width={220} tilt={2} edge="lr-2" />
        <Washi inline pattern="grid" width={240} tilt={-3} />
        <Washi inline pattern="hearts" width={280} tilt={1} />
      </div>
    ),
  }),
  story({
    name: 'Polaroid',
    category: 'Foundations',
    description: 'Polaroid frame with handwritten caption, optional tape and corner tag - for photos or placeholders.',
    width: 760,
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 34, alignItems: 'start' }}>
        <Polaroid width={210} tilt={-5} tape caption="Sommer 2024" color="sky"><Icon name="image" size={48} /></Polaroid>
        <Polaroid width={210} tilt={3} caption="DVN Network" tag="MC" color="pink"><PixelHeart size={80} style={{ color: 'var(--pp-pink)' }} /></Polaroid>
        <Polaroid width={210} tilt={-2} caption="mint" color="mint"><span className="pp-display" style={{ fontSize: 60 }}>J</span></Polaroid>
      </div>
    ),
  }),
  story({
    name: 'StickyNote',
    category: 'Foundations',
    description: 'Sticky note with a peeling corner (lifts further on hover), pinned with a pushpin or tape.',
    animation: { steps: [{ wait: 300 }, { hover: '.pp-sticky-curl' }, { wait: 900 }, { leave: true }, { wait: 500 }] },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 34 }}>
        <StickyNote color="mint" pin hand style={{ width: 200 }}>Milch kaufen und die Welt retten.</StickyNote>
        <StickyNote color="butter" tape tilt={3} hand style={{ width: 200 }}>Nicht vergessen: Pause machen ♥</StickyNote>
        <StickyNote color="pink" tilt={-1} curl style={{ width: 200 }}><b>Normaler Text</b><p>geht auch ohne Marker-Schrift. Fahr mit der Maus über die Ecke.</p></StickyNote>
      </div>
    ),
  }),
  story({
    name: 'TodoList',
    category: 'Foundations',
    description: 'Static handwritten to-do list with drawn boxes and pink ticks - best on a StickyNote.',
    notes: 'For a list people can tick off, use `Checklist` (Apps).',
    width: 420,
    example: () => (
      <StickyNote tilt={3} style={{ width: 300 }}>
        <div className="pp-display" style={{ fontSize: 22 }}>GERADE SO</div>
        <TodoList items={[{ label: 'Ausbildung abschließen', done: true }, { label: 'neue Domain', done: true }, { label: 'durchatmen' }]} />
      </StickyNote>
    ),
  }),
  story({
    name: 'LabelTags',
    category: 'Foundations',
    description: 'Label-maker (Dymo) tags for skills, tools and categories.',
    width: 640,
    example: () => (
      <div style={{ display: 'grid', gap: 26 }}>
        <LabelTags items={['TypeScript', 'React', 'Swift', 'Docker', 'Minecraft', 'Prisma']} />
        <LabelTags size="sm" items={[{ label: 'neu', color: 'mint' }, { label: 'beliebt', color: 'pink' }, { label: 'beta', color: 'ink' }]} />
      </div>
    ),
  }),
  story({
    name: 'Stamp',
    category: 'Foundations',
    description: 'Rubber stamp that thumps onto the page - success states, "sent!", "sold out".',
    height: 260,
    animation: { steps: [{ wait: 300 }, { click: 'button' }, { wait: 1300 }] },
    example: function Example() {
      const [sent, setSent] = useState(false);
      return (
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center', minHeight: 180 }}>
          <button type="button" className="pp-btn" onClick={() => setSent((s) => !s)}>Abschicken ♥</button>
          <Stamp overlay show={sent} note="ich melde mich bei dir ♥">Angekommen!</Stamp>
        </div>
      );
    },
  }),
  story({
    name: 'Sticker',
    category: 'Foundations',
    description: 'Round, burst or star sticker for "NEU!" labels - wiggles on hover or spins slowly.',
    animation: { steps: [{ wait: 200 }, { hover: '.pp-sticker' }, { wait: 700 }, { leave: true }, { wait: 700 }] },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
        <Sticker shape="burst" color="butter">Neu!</Sticker>
        <Sticker shape="circle" color="pink" size={110} tilt={-10}>-20%</Sticker>
        <Sticker shape="star" color="mint" size={120}>Top</Sticker>
        <Sticker shape="circle" color="sky" spin>Hi!</Sticker>
      </div>
    ),
  }),
  story({
    name: 'Marker',
    category: 'Foundations',
    description: 'Marks inline text with a highlighter, scribbled underline, circle, strike or washi tape - drawn in on view.',
    width: 760,
    animation: { duration: 1600 },
    example: () => (
      <p style={{ fontSize: 22, lineHeight: 2.2, margin: 0 }}>
        Ich bin <Marker>Entwickler</Marker>, baue <Marker variant="underline" color="pink">Webseiten</Marker> und
        {' '}<Marker variant="circle" color="sky">Apps</Marker>, war <Marker variant="strike">nie</Marker> ohne Pläne und
        {' '}<Marker variant="washi">klebe gern Tape</Marker> auf alles.
      </p>
    ),
  }),
  story({
    name: 'Doodle',
    category: 'Foundations',
    description: 'Hand-drawn arrows, circles, squiggles, stars and hearts that draw themselves in.',
    animation: { duration: 1500 },
    example: () => (
      <div style={{ display: 'flex', gap: 30, alignItems: 'center', flexWrap: 'wrap' }}>
        <Doodle kind="arrow" />
        <Doodle kind="curly-arrow" color="var(--pp-pink)" />
        <Doodle kind="circle" />
        <Doodle kind="squiggle" color="var(--pp-sky)" size={150} />
        <Doodle kind="star" size={60} color="var(--pp-pink)" />
        <Doodle kind="heart" size={60} />
        <Doodle kind="burst" size={60} />
        <Doodle kind="spiral" size={60} color="var(--pp-lilac)" />
      </div>
    ),
  }),
  story({
    name: 'Cutline',
    category: 'Foundations',
    description: 'Dashed "cut here" divider - click it and the scissors snip along the line.',
    animation: { steps: [{ wait: 300 }, { click: '.pp-cutline' }, { wait: 2500 }], fps: 15 },
    notes: 'Click anywhere on the line to cut. With `onView` it cuts once by itself when it scrolls into view (the Footer does this).',
    example: () => <Cutline label="hier abschneiden" style={{ margin: 0 }} />,
  }),
  story({
    name: 'Heading',
    category: 'Foundations',
    description: 'Chunky display headings in five sizes plus the handwritten Kicker line.',
    exports: ['Heading', 'Kicker'],
    width: 800,
    example: () => (
      <div>
        <Kicker>hi, schön dass du da bist ♥</Kicker>
        <Heading level={1} size="xl">Ich bin Jack<em>.</em></Heading>
        <Heading size="md" style={{ marginTop: 20 }}>Eine Zwischenüberschrift</Heading>
        <p style={{ marginTop: 12 }}>Fließtext in IBM Plex Mono, <span className="pp-hand" style={{ fontSize: 20 }}>Notizen in Marker</span>, <span className="pp-caps">Labels in Caps</span>.</p>
      </div>
    ),
  }),
  story({
    name: 'Notebook',
    category: 'Foundations',
    description: 'Ruled notebook page with a red margin line - long text sits on the lines.',
    example: () => (
      <Notebook holes>
        <h2>Was ich gelernt habe</h2>
        <p>Ein Server mit 110 Spielern zeigt dir schnell, was du noch nicht weißt. Und dass Freundschaften länger halten als jede Map.</p>
      </Notebook>
    ),
  }),
  story({
    name: 'Icon',
    category: 'Foundations',
    description: 'Chunky line icon set (plus filled heart, sparkle, star) and the DVN pixel heart.',
    exports: ['Icon', 'PixelHeart'],
    width: 800,
    notes: 'All icon names are exported as `ICON_NAMES`. Icons inherit `color`; pass `label` to make an icon meaningful for screen readers.',
    example: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 10 }}>
        {ICON_NAMES.map((n) => (
          <div key={n} style={{ display: 'grid', justifyItems: 'center', gap: 4, fontSize: 10 }}>
            <Icon name={n} size={26} />
            {n}
          </div>
        ))}
        <div style={{ display: 'grid', justifyItems: 'center', gap: 4, fontSize: 10 }}><PixelHeart size={28} style={{ color: 'var(--pp-pink)' }} />PixelHeart</div>
      </div>
    ),
  }),
  story({
    name: 'PaperPopEffects',
    category: 'Foundations',
    description: 'Page effects: sparkles on every click and washi tape text selection. Mount once at the app root.',
    notes: 'Also available as plain functions: `installSparkles()`, `installWashiSelection()` (both return an uninstall function) and `burstSparkles(x, y)`. Everything respects `prefers-reduced-motion`.',
    height: 220,
    animation: { steps: [{ wait: 100 }, { click: '.pp-sticky' }, { wait: 800 }] },
    example: () => (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
        <PaperPopEffects />
        <StickyNote color="butter" hand>Klick irgendwo hin ✦ und markier mal Text.</StickyNote>
      </div>
    ),
  }),
  story({
    name: 'TitleTypewriter',
    category: 'Foundations',
    description: 'Types the browser tab title: the old one is deleted back to the shared beginning, the new one is typed out.',
    notes: 'Mount once at the app root. Pass `title` to set it directly, or leave it out to animate titles that a framework sets (e.g. Next metadata) - the whole `<head>` is observed because frameworks replace the `<title>` element. Plain function: `installTitleTypewriter(options)` returns an uninstall function. Background tabs and `prefers-reduced-motion` skip the animation.',
    height: 180,
    animation: { steps: [{ wait: 200 }, { click: 'button' }, { wait: 2600 }] },
    example: function Example() {
      const pages = ['Paper Pop - Paper', 'Paper Pop - Polaroid', 'Paper Pop - Washi'];
      const [i, setI] = useState(-1);
      const [tab, setTab] = useState('');
      useEffect(() => {
        const read = () => setTab(document.title);
        read();
        const obs = new MutationObserver(read);
        obs.observe(document.head, { childList: true, characterData: true, subtree: true });
        return () => obs.disconnect();
      }, []);
      return (
        <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
          <TitleTypewriter title={pages[i]} />
          <div className="pp-display" style={{ padding: '8px 16px', border: '2.5px solid var(--pp-ink)', borderRadius: '10px 10px 0 0', background: 'var(--pp-paper)', minWidth: 300 }}>{tab || '\u00a0'}</div>
          <button className="pp-btn" onClick={() => setI((n) => (n + 1) % pages.length)}>Nächste Seite</button>
        </div>
      );
    },
  }),
  story({
    name: 'Confetti',
    category: 'Foundations',
    description: 'Paper confetti burst - fire it on success moments by changing a counter.',
    notes: 'Imperative version: `burstConfetti(x, y, count)` with viewport coordinates.',
    height: 300,
    animation: { steps: [{ wait: 100 }, { click: 'button' }, { wait: 1300 }] },
    example: function Example() {
      const [fire, setFire] = useState(0);
      return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 220, position: 'relative' }}>
          <button type="button" className="pp-btn pp-c-butter" onClick={() => setFire((n) => n + 1)}>
            Geschafft!
            <Confetti fire={fire} />
          </button>
        </div>
      );
    },
  }),
];
