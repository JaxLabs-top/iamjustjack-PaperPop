// Made by Jack (iamjustjack.de)
import { useRef, useState } from 'react';
import {
  AppShell, Avatar, Button, ChatThread, Checklist, CodeBlock, Drawer, Kbd, KanbanBoard, MiniCalendar, SearchInput, Sidebar, StatCard,
  Switch, type ChatMessage,
} from '../src';
import { story } from './types';

export default [
  story({
    name: 'AppShell',
    category: 'Apps',
    description: 'Dashboard frame: sidebar left, top bar and content right; the sidebar slides in on phones.',
    width: 1100,
    example: () => (
      <div style={{ height: 460, overflow: 'hidden' }}>
        <AppShell
          style={{ minHeight: 0, padding: 0 }}
          sidebar={<Sidebar brand="studio" style={{ height: 440 }} sections={[{ links: [{ label: 'Übersicht', href: '#', icon: 'home', active: true }, { label: 'Statistiken', href: '#s', icon: 'chart' }, { label: 'Einstellungen', href: '#e', icon: 'settings' }] }]} />}
          topbar={<><h1 className="pp-display" style={{ fontSize: 28, flex: 1 }}>Übersicht</h1><SearchInput value="" onChange={() => {}} /><Avatar name="Jack" /></>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            <StatCard label="Besucher" value="1.284" delta={12} icon="users" />
            <StatCard label="Nachrichten" value="36" delta={4} icon="mail" color="mint" />
            <StatCard label="Uptime" value="99,9" suffix="%" icon="zap" color="pink" />
          </div>
        </AppShell>
      </div>
    ),
  }),
  story({
    name: 'ChatThread',
    category: 'Apps',
    description: 'Chat with grouped bubbles, typing indicator and input row. In this demo Kim and Boby answer whatever you send.',
    exports: ['ChatThread', 'ChatBubble'],
    width: 560,
    animation: { steps: [{ wait: 300 }, { type: '.pp-chat-input input', text: 'Bin dabei!' }, { click: '.pp-chat-input button' }, { wait: 2600 }], fps: 12 },
    example: function Example() {
      const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, author: 'Kim', text: 'Hey! Bist du heute Abend online?', time: '18:02' },
        { id: 2, author: 'Kim', text: 'Wir wollten die neue Map testen.', time: '18:02' },
        { id: 3, author: 'Jack', text: 'Klar, ab 20 Uhr ♥', time: '18:05', own: true },
      ]);
      const [typing, setTyping] = useState<string>();
      const replies = useRef([['Kim', 'Haha, stimmt ♥'], ['Boby', 'Bin gleich da!'], ['Kim', 'Das probier ich direkt aus ✨'], ['Boby', 'Sag ich doch 😄'], ['Kim', 'Warte, ich schau kurz nach …']] as const);
      const n = useRef(0);
      function send(text: string) {
        setMessages((m) => [...m, { id: Date.now(), author: 'Jack', text, own: true }]);
        const [who, answer] = replies.current[n.current++ % replies.current.length]!;
        setTimeout(() => setTyping(who), 500);
        setTimeout(() => {
          setTyping(undefined);
          setMessages((m) => [...m, { id: Date.now() + 1, author: who, text: answer }]);
        }, 500 + 900 + answer.length * 30);
      }
      return <ChatThread height={260} messages={messages} typing={typing} onSend={send} />;
    },
  }),
  story({
    name: 'KanbanBoard',
    category: 'Apps',
    description: 'Drag-and-drop board of sticky notes in columns.',
    width: 900,
    example: () => (
      <KanbanBoard columns={[
        { id: 'todo', title: 'To do', cards: [{ id: '1', title: 'Logo skizzieren', tag: { label: 'Design', color: 'lilac' }, assignee: 'Kim', due: 'Mi' }, { id: '2', title: 'Domain kaufen', due: 'Fr', assignee: 'Boby' }] },
        { id: 'doing', title: 'In Arbeit', color: 'sky', cards: [{ id: '3', title: 'Landingpage bauen', assignee: 'Jack', due: 'Mo', tag: { label: 'Web', color: 'butter' } }] },
        { id: 'done', title: 'Fertig', color: 'mint', cards: [{ id: '4', title: 'Repo anlegen', assignee: 'Kim' }] },
      ]} />
    ),
  }),
  story({
    name: 'MiniCalendar',
    category: 'Apps',
    description: 'Month calendar on a tear-off pad with selected day, today marker and event dots. Click the month to jump to any month and year.',
    notes: 'In the month picker you can type the year, use the arrow keys or scroll with the mouse wheel.',
    width: 420,
    example: function Example() {
      const [day, setDay] = useState(new Date(2026, 8, 18));
      return <MiniCalendar value={day} onChange={setDay} marked={[new Date(2026, 8, 4), new Date(2026, 8, 22), new Date(2026, 8, 29)]} />;
    },
  }),
  story({
    name: 'Checklist',
    category: 'Apps',
    description: 'To-do list on a sticky note - tick items off, optionally add new ones.',
    width: 460,
    animation: { steps: [{ wait: 300 }, { click: 'li:nth-child(2) label' }, { wait: 700 }] },
    example: () => (
      <Checklist title="Heute" addable items={[
        { id: 'a', label: 'Kaffee', done: true },
        { id: 'b', label: 'Paper Pop pushen' },
        { id: 'c', label: 'Mama anrufen' },
      ]} />
    ),
  }),
  story({
    name: 'Kbd',
    category: 'Apps',
    description: 'Keyboard key caps for shortcuts.',
    example: () => <p style={{ margin: 0 }}>Suche öffnen mit <Kbd keys={['⌘', 'K']} /> oder einfach <Kbd keys="/" />.</p>,
  }),
  story({
    name: 'CodeBlock',
    category: 'Apps',
    description: 'Code snippet with file tab and copy button - language is detected automatically, 20 languages in 8 colour styles.',
    notes: 'Leave `language` on "auto" and the block detects TypeScript/JSX, JSON, HTML, CSS, shell, Python, Go, Rust, Java, C#, C/C++, PHP, Ruby, SQL, YAML, TOML, Markdown, diff and Dockerfile; aliases such as `ts`, `sh`, `yml` also work. `theme` is `ink` (dark, default), `paper`, `pink`, `butter`, `mint`, `sky`, `lilac` or `auto` (follows the system light/dark setting).',
    width: 760,
    example: () => (
      <div style={{ display: 'grid', gap: 24 }}>
        <CodeBlock lineNumbers code={'git submodule add https://github.com/JaxLabs-top/iamjustjack-PaperPop.git paperpop\nnpm run dev'} />
        <CodeBlock theme="paper" title="Button.tsx" code={'export function Button({ label }: { label: string }) {\n  // pops on hover\n  return <button className="pp-btn" onClick={() => alert(42)}>{label}</button>;\n}'} />
        <CodeBlock theme="mint" code={'{ "name": "paperpop", "private": true, "engines": { "node": ">=22" } }'} />
        <CodeBlock theme="sky" code={'SELECT id, name FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 10;'} />
        <CodeBlock theme="pink" code={'.pp-btn:hover {\n  color: var(--pp-pink);\n  transform: rotate(-2deg) scale(1.04);\n}'} />
      </div>
    ),
  }),
  story({
    name: 'Drawer',
    category: 'Apps',
    description: 'A sheet of paper sliding in from the side - filters, details, settings.',
    viewport: { width: 860, height: 520 },
    animation: { steps: [{ wait: 200 }, { click: 'button' }, { wait: 800 }] },
    example: function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button color="sky" icon="settings" onClick={() => setOpen(true)}>Einstellungen</Button>
          <Drawer open={open} onClose={() => setOpen(false)} title="Einstellungen">
            <div style={{ display: 'grid', gap: 16 }}>
              <Switch label="Benachrichtigungen" defaultChecked />
              <Switch label="Newsletter" />
              <Switch label="Sparkles beim Klicken" defaultChecked color="pink" />
            </div>
          </Drawer>
        </>
      );
    },
  }),
];
