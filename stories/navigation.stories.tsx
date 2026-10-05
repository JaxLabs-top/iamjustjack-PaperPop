// Made by Jack (iamjustjack.de)
import { useState } from 'react';
import { Accordion, Breadcrumbs, Button, Footer, Menu, Navbar, Pagination, Sidebar, Steps, Tabs, Timeline } from '../src';
import { story } from './types';

export default [
  story({
    name: 'Navbar',
    category: 'Navigation',
    description: 'Top bar with brand and pill links; turns into a menu button on phones.',
    width: 900,
    example: () => (
      <Navbar
        brand="jack"
        links={[
          { label: 'der name', href: '#name', active: true },
          { label: 'projekte', href: '#projects' },
          { label: 'hallo sagen', href: '#contact' },
        ]}
        actions={<Button size="sm" color="butter">Login</Button>}
        style={{ padding: 0 }}
      />
    ),
  }),
  story({
    name: 'Footer',
    category: 'Navigation',
    description: 'Torn footer strip with brand, note, legal links and a scissors cut line above.',
    width: 900,
    example: () => (
      <Footer
        brand="JACK"
        note="© 2026 Jack · Kein Tracking, versprochen."
        links={[{ label: 'Impressum', href: '/imprint' }, { label: 'Datenschutz', href: '/privacy' }]}
        aside={<a href="#top">nach oben ↑</a>}
        style={{ marginTop: 0 }}
      />
    ),
  }),
  story({
    name: 'Tabs',
    category: 'Navigation',
    description: 'Folder-style index tabs sticking out of a card; arrow keys switch.',
    width: 640,
    animation: { steps: [{ wait: 300 }, { click: '[role=tab]:nth-child(2)' }, { wait: 600 }, { click: '[role=tab]:nth-child(3)' }, { wait: 600 }] },
    example: () => (
      <Tabs items={[
        { id: 'posts', label: 'Beiträge', icon: 'chat', content: <p>Hier stehen die neuesten Beiträge.</p> },
        { id: 'likes', label: 'Likes', icon: 'heart', content: <p>Alles, was dir gefallen hat.</p> },
        { id: 'about', label: 'Über mich', icon: 'user', content: <p>Entwickler, Ex-DVN, frisch ausgelernt.</p> },
      ]} />
    ),
  }),
  story({
    name: 'Accordion',
    category: 'Navigation',
    description: 'Folding strips for FAQs and settings groups.',
    width: 640,
    animation: { steps: [{ wait: 300 }, { click: '.pp-acc-item:nth-child(2) button' }, { wait: 700 }] },
    example: () => (
      <Accordion defaultOpen={['a']} items={[
        { id: 'a', title: 'Was ist Paper Pop?', content: 'Die Komponenten-Bibliothek hinter iamjustjack.de - zerrissenes Papier, Pastell und Polaroids.' },
        { id: 'b', title: 'Kann ich das nutzen?', content: 'Klar, als Git-Submodule in jede Vite + React Seite.' },
        { id: 'c', title: 'Gibt es einen Dark Mode?', content: 'Noch nicht. Papier ist hell.' },
      ]} />
    ),
  }),
  story({
    name: 'Breadcrumbs',
    category: 'Navigation',
    description: 'Path navigation with handwritten arrows; the current page gets a label.',
    example: () => <Breadcrumbs items={[{ label: 'Forum', href: '/forum' }, { label: 'Hilfe', href: '/forum/help' }, { label: 'Server startet nicht' }]} />,
  }),
  story({
    name: 'Pagination',
    category: 'Navigation',
    description: 'Page numbers as crooked paper squares with prev/next arrows.',
    example: function Example() {
      const [page, setPage] = useState(4);
      return <Pagination page={page} pages={12} onChange={setPage} />;
    },
  }),
  story({
    name: 'Sidebar',
    category: 'Navigation',
    description: 'Vertical app navigation with sections, icons, badges and a footer.',
    width: 360,
    example: () => (
      <Sidebar
        brand="studio"
        sections={[
          { links: [{ label: 'Übersicht', href: '#', icon: 'home', active: true }, { label: 'Statistiken', href: '#s', icon: 'chart' }, { label: 'Nachrichten', href: '#m', icon: 'mail', badge: 4 }] },
          { title: 'Inhalte', links: [{ label: 'Beiträge', href: '#p', icon: 'file' }, { label: 'Medien', href: '#i', icon: 'image' }] },
        ]}
        footer={<a href="#logout" className="pp-pill pp-pill-sm">Abmelden</a>}
      />
    ),
  }),
  story({
    name: 'Menu',
    category: 'Navigation',
    description: 'Dropdown menu on a paper card - keyboard navigation (arrows, Home/End, type-ahead), closes on outside click and Escape.',
    height: 300,
    animation: { steps: [{ wait: 200 }, { click: '.pp-menu > button' }, { wait: 700 }] },
    example: () => (
      <Menu trigger="Aktionen" items={[
        { label: 'Bearbeiten', icon: 'pen' },
        { label: 'Teilen', icon: 'link' },
        { label: 'Anpinnen', icon: 'pin' },
        { label: 'Löschen', icon: 'trash', danger: true, divider: true },
      ]} />
    ),
  }),
  story({
    name: 'Steps',
    category: 'Navigation',
    description: 'Numbered torn cards in a row - "how it works" sections. They fly in one after another on scroll.',
    animation: { duration: 2200, fps: 15 },
    width: 900,
    example: () => (
      <Steps items={[
        { title: 'Repo anlegen', text: 'Template nutzen, fertig.' },
        { title: 'Komponenten wählen', text: 'Alles liegt in Paper Pop.' },
        { title: 'Seite bauen', text: 'Zusammenstecken wie Lego.' },
        { title: 'Pushen', text: 'Der Runner deployt.' },
      ]} />
    ),
  }),
  story({
    name: 'Timeline',
    category: 'Navigation',
    description: 'Vertical timeline with a dashed line and pastel dots.',
    width: 520,
    example: () => (
      <Timeline items={[
        { date: 'März', title: 'Idee auf einem Zettel', text: 'Ein Abend, zu viel Kaffee.', icon: 'coffee' },
        { date: 'Juni', title: 'Erste Version online', text: 'Klein, aber läuft.', icon: 'rocket' },
        { date: 'heute', title: '1.000 Leute dabei', text: 'Und es geht weiter.', icon: 'sparkle' },
      ]} />
    ),
  }),
];
