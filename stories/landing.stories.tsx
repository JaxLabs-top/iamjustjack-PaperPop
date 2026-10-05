// Made by Jack (iamjustjack.de)
import { Button, CtaBanner, LinkCard, FeatureGrid, Hero, Icon, LogoCloud, Marquee, Newsletter, PixelHeart, Polaroid, PolaroidStack, PricingTable, Testimonial } from '../src';
import { story } from './types';

export default [
  story({
    name: 'Hero',
    category: 'Landing',
    description: 'Big torn title sheet with kicker, lead and buttons next to a taped polaroid.',
    width: 1000,
    example: () => (
      <Hero
        kicker="hi, schön dass du da bist ♥"
        title={<>Ich bin<br />Jack<em>.</em></>}
        lead="Entwickler. Ehemaliger Betreiber des DVN Network. Und irgendwann mal: mein eigener Chef."
        actions={<><Button>Sag Hallo ♥</Button><a href="#projects" className="pp-pill">Projekte</a></>}
        media={<Polaroid tape tilt={5} width="100%" caption="das bin ich" color="lilac"><Icon name="smile" size={80} /></Polaroid>}
        style={{ padding: 0 }}
      />
    ),
  }),
  story({
    name: 'FeatureGrid',
    category: 'Landing',
    description: 'Grid of torn feature cards with icon stickers, alternating colours and tilts.',
    exports: ['FeatureGrid', 'FeatureCard'],
    width: 980,
    example: () => (
      <FeatureGrid items={[
        { icon: 'zap', title: 'Schnell gebaut', text: 'Komponenten zusammenstecken, fertig ist die Seite.' },
        { icon: 'heart', title: 'Mit Liebe', text: 'Jedes Detail ein bisschen schief - mit Absicht.' },
        { icon: 'shield', title: 'Kein Tracking', text: 'Keine Cookies, keine Werbung, keine Tricks.' },
      ]} />
    ),
  }),
  story({
    name: 'PricingTable',
    category: 'Landing',
    description: 'Pricing plans side by side; the featured one gets a sticker and a bigger shadow.',
    exports: ['PricingTable', 'PricingCard'],
    width: 1000,
    example: () => (
      <PricingTable plans={[
        { name: 'Free', price: '0 €', period: '/ Monat', features: ['1 Seite', 'Community-Support'], cta: 'Loslegen' },
        { name: 'Pro', price: '9 €', period: '/ Monat', description: 'Für alle, die mehr wollen.', features: ['10 Seiten', 'Eigene Domain', 'Statistiken'], cta: 'Pro holen', featured: true },
        { name: 'Team', price: '29 €', period: '/ Monat', features: ['Unbegrenzt', 'Rollen & Rechte', 'Priority-Support'], cta: 'Kontakt' },
      ]} />
    ),
  }),
  story({
    name: 'Testimonial',
    category: 'Landing',
    description: 'Quote on a taped note with a mini polaroid of the author.',
    width: 560,
    example: () => (
      <Testimonial quote="Jack ist ein richtig guter und netter Chef 😂" name="Boby" role="Mod" />
    ),
  }),
  story({
    name: 'CtaBanner',
    category: 'Landing',
    description: 'Wide torn banner with headline and buttons - the end-of-page call to action.',
    width: 960,
    example: () => (
      <CtaBanner title="Lust auf ein Projekt?" text="Schreib mir, ich antworte meistens noch am selben Tag." actions={<><Button color="butter">Sag Hallo ♥</Button><a className="pp-pill" href="#more">Mehr erfahren</a></>} />
    ),
  }),
  story({
    name: 'Newsletter',
    category: 'Landing',
    description: 'E-mail signup card with airmail stripes and a success stamp.',
    width: 620,
    animation: { steps: [{ wait: 200 }, { type: 'input', text: 'kim@example.de' }, { click: 'button' }, { wait: 900 }] },
    example: () => (
      <Newsletter text="Einmal im Monat, was ich gebaut habe. Kein Spam." onSubscribe={async (email) => { console.log(email); }} />
    ),
  }),
  story({
    name: 'PolaroidStack',
    category: 'Landing',
    description: 'A pile of polaroids that fans out on hover (on scroll into view on touch devices).',
    width: 980,
    height: 440,
    animation: { steps: [{ wait: 300 }, { hover: '.pp-pstack' }, { wait: 900 }, { hover: '.pp-pstack-item:nth-child(2)' }, { wait: 600 }] },
    example: () => (
      <PolaroidStack items={[
        { title: 'DVN Network', tag: 'MC', href: '#dvn', photo: <PixelHeart size={80} style={{ color: 'var(--pp-pink)' }} /> },
        { title: 'iamjustjack.de', tag: 'WEB', href: '#site' },
        { title: 'MyID', tag: 'AUTH', href: '#myid' },
      ]} />
    ),
  }),
  story({
    name: 'Marquee',
    category: 'Landing',
    description: 'Endless strip of tape with scrolling words - between sections or as a ticker.',
    width: 900,
    animation: { duration: 3000, fps: 15 },
    example: () => (
      <div style={{ display: 'grid', gap: 30, overflow: 'hidden', padding: '10px 0' }}>
        <Marquee items={['Webseiten', 'Apps', 'Server', 'Minecraft', 'Design']} speed={12} />
        <Marquee items={['kein Tracking', 'selbst gehostet', 'mit Liebe gebaut']} color="washi" tilt={1.5} reverse speed={12} />
      </div>
    ),
  }),
  story({
    name: 'LinkCard',
    category: 'Landing',
    description: 'Link-in-bio row on a torn card with icon, title and subtitle - links, external profiles or copy-a-username.',
    width: 560,
    animation: { steps: [{ wait: 200 }, { hover: '.pp-linkcard' }, { wait: 400 }, { click: 'button.pp-linkcard' }, { wait: 500 }] },
    example: () => (
      <div style={{ display: 'grid', gap: 18 }}>
        <LinkCard href="/#contact" icon="pen" title="Schreib mir" subtitle="übers Kontaktformular" tilt={-1.2} />
        <LinkCard href="https://www.instagram.com/" icon="instagram" title="Instagram" subtitle="@iamjustjack.de · Fotos" color="mint" edge="card-2" tilt={0.9} />
        <LinkCard copyText="jackfeuchte.01" icon="signal" title="Signal" subtitle="jackfeuchte.01 · verschlüsselt schreiben" color="sky" edge="card-3" tilt={-0.6} />
      </div>
    ),
  }),
  story({
    name: 'LogoCloud',
    category: 'Landing',
    description: '"Known from" row with image logos or label-maker text tags.',
    example: () => <LogoCloud logos={[{ name: 'Minecraft' }, { name: 'GitHub' }, { name: 'Discord' }, { name: 'Docker' }]} />,
  }),
];
