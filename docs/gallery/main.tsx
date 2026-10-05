// Made by Jack (iamjustjack.de)
import 'paperpop/fonts';
import 'paperpop/styles.css';
import './gallery.css';
import { StrictMode, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { CodeBlock, Heading, Kicker, ToastProvider } from 'paperpop';
import { STORIES } from '../../stories';
import meta from '../components.json';
import { CATEGORIES, type Story } from '../../stories/types';

const params = new URLSearchParams(location.search);
const only = params.get('story');
if (params.has('capture')) {
  document.documentElement.classList.add('pp-no-grain', 'pp-capture');
  let seed = 42;
  Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

const docTitle = (name?: string) => (name ? `Paper Pop Docs - ${name}` : 'Paper Pop Docs');

const REPO = 'https://github.com/JaxLabs-top/iamjustjack-PaperPop';

interface Meta { source: string; doc: string; story: string; example: string; notes?: string; props: Record<string, { name: string; optional: boolean; type: string; default?: string; description: string }[] | null> }
const META = new Map<string, Meta>((meta.components as unknown as (Meta & { name: string })[]).map((c) => [c.name, c]));

const GH_ICON = 'M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.55v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.8.55A11.5 11.5 0 0 0 12 .5z';

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const to = () => el.scrollIntoView({ behavior: 'instant' });
  to();
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  let stop = false;
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const cancel = () => { stop = true; };
  for (const ev of events) window.addEventListener(ev, cancel, { passive: true });
  const timers = [100, 300, 700, 1500].map((ms) => setTimeout(() => { if (!stop && Math.abs(el.getBoundingClientRect().top - margin) > 2) to(); }, ms));
  setTimeout(() => { timers.forEach(clearTimeout); for (const ev of events) window.removeEventListener(ev, cancel); }, 1600);
}

function Inline({ text }: { text: string }) {
  return <>{text.split(/(`[^`]+`)/).map((t, i) => (t.startsWith('`') ? <code key={i}>{t.slice(1, -1)}</code> : t))}</>;
}

function Card({ story }: { story: Story }) {
  const [run, setRun] = useState(0);
  const [open, setOpen] = useState<'code' | 'props' | 'notes' | null>(null);
  const toggle = (k: 'code' | 'props' | 'notes') => setOpen((o) => (o === k ? null : k));
  const m = META.get(story.name);
  const groups = Object.entries(m?.props ?? {}).filter((e): e is [string, NonNullable<(typeof e)[1]>] => !!e[1]?.length);
  return (
    <article id={story.name} className="g-card">
      <div className="g-card-head">
        <div>
          <h3 className="pp-display">{story.name}</h3>
          <p>{story.description}</p>
          <a href={`?story=${story.name}`}>isoliert öffnen →</a>
        </div>
        <div className="g-actions">
          <button type="button" className="g-btn" onClick={() => setRun((n) => n + 1)} aria-label={`${story.name}-Vorschau neu laden`} title="Vorschau neu laden">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Reload
          </button>
          <a className="g-btn" href={`${REPO}/blob/main/${m?.doc ?? `docs/components/${story.name}.md`}`} target="_blank" rel="noreferrer" aria-label={`${story.name} auf GitHub`} title="Doku auf GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={GH_ICON} fill="currentColor" /></svg>
            GitHub
          </a>
        </div>
      </div>
      <Stage key={run} story={story} />
      {m && (
        <div className="g-docs">
          <div className="g-tabs">
            <button type="button" className={`g-icon${open === 'code' ? ' on' : ''}`} onClick={() => toggle('code')} aria-expanded={open === 'code'} aria-label="Code anzeigen" title="Code">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {groups.length > 0 && (
              <button type="button" className={`g-icon${open === 'props' ? ' on' : ''}`} onClick={() => toggle('props')} aria-expanded={open === 'props'} aria-label="Props anzeigen" title="Props">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M9 4v16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              </button>
            )}
            {m.notes && (
              <button type="button" className={`g-icon${open === 'notes' ? ' on' : ''}`} onClick={() => toggle('notes')} aria-expanded={open === 'notes'} aria-label="Hinweise anzeigen" title="Hinweise">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v.01M12 12v5M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>
          {open === 'code' && <div key="code" className="g-panel"><CodeBlock title={`${story.name}.tsx`} code={m.example} /></div>}
          {open === 'props' && (
            <div key="props" className="g-panel g-props">
              {groups.map(([name, props]) => (
                <div key={name}>
                  {groups.length > 1 && <b>{name}</b>}
                  <table>
                    <thead><tr><th>Prop</th><th>Typ</th><th>Default</th><th>Beschreibung</th></tr></thead>
                    <tbody>
                      {props.map((p) => (
                        <tr key={p.name}>
                          <td><code>{p.name}{p.optional ? '' : '*'}</code></td>
                          <td><code>{p.type}</code></td>
                          <td>{p.default ? <code>{p.default}</code> : ''}</td>
                          <td>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
          {open === 'notes' && m.notes && <p key="notes" className="g-panel g-notes"><Inline text={m.notes} /></p>}
        </div>
      )}
    </article>
  );
}

function noJump(e: MouseEvent<HTMLElement>) {
  if ((e.target as Element).closest('a[href^="#"]')) e.preventDefault();
}

function Stage({ story, solo }: { story: Story; solo?: boolean }) {
  const Example = story.example;
  return (
    <div id={solo ? 'stage' : undefined} className="g-stage" onClickCapture={noJump} style={{ width: story.width ?? 720, minHeight: story.height }}>
      <Example />
    </div>
  );
}

function Gallery() {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(location.hash.slice(1));
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STORIES.filter((s) => !q || `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(q));
  }, [query]);

  /** Keeps the URL (and tab title) on the component that is currently being read. */
  const sync = (name: string) => {
    setActive(name);
    const url = name ? `#${name}` : location.pathname + location.search;
    if (location.hash.slice(1) !== name) history.replaceState(null, '', url);
    document.title = docTitle(name);
  };

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = '';
      for (const el of document.querySelectorAll<HTMLElement>('.g-card')) {
        if (el.getBoundingClientRect().top <= window.innerHeight * 0.3) current = el.id;
        else break;
      }
      sync(current);
    };
    const onScroll = () => { frame ||= requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [list]);

  useEffect(() => {
    const on = () => {
      const name = location.hash.slice(1);
      setActive(name);
      document.title = docTitle(name);
      scrollToId(name);
    };
    on();
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useEffect(() => {
    const a = document.querySelector<HTMLElement>('.g-nav a.on');
    const nav = a?.closest<HTMLElement>('.g-nav');
    if (!a || !nav) return;
    const head = nav.querySelector<HTMLElement>('.g-nav-head')?.offsetHeight ?? 0;
    const r = a.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    if (r.top < n.top + head) nav.scrollTop -= n.top + head - r.top + 8;
    else if (r.bottom > n.bottom) nav.scrollTop += r.bottom - n.bottom + 8;
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const search = searchRef.current;
      if (!search) return;
      if (e.key === 'Escape' && t === search) { setQuery(''); search.blur(); return; }
      if (e.key.length !== 1 || e.key === ' ' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      if (t?.closest('input, textarea, select, [contenteditable], [role="dialog"], .g-stage')) return;
      search.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /** Category buttons scroll without touching the hash, which belongs to the component being read. */
  const goCategory = (e: MouseEvent<HTMLAnchorElement>, c: string) => {
    e.preventDefault();
    scrollToId(`cat-${c}`);
  };

  const jump = (e: MouseEvent<HTMLAnchorElement>, name: string) => {
    e.preventDefault();
    setMenu(false);
    scrollToId(name);
    sync(name);
  };

  return (
    <div className="g-layout">
      <aside className={`g-nav${menu ? ' open' : ''}`}>
        <div className="g-nav-head">
        <div className="g-nav-top">
          <a className="g-logo pp-display" href="#">paper<em>pop</em></a>
          <button type="button" className="g-btn g-menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>{menu ? 'Schließen' : 'Komponenten'}</button>
        </div>
          <input ref={searchRef} className="g-search" type="search" enterKeyHint="search" autoComplete="off" placeholder="Tippen zum Suchen …" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {CATEGORIES.map((c) => {
          const items = list.filter((s) => s.category === c);
          if (!items.length) return null;
          return (
            <nav key={c} aria-label={c}>
              <b className="pp-caps">{c}</b>
              {items.map((s) => <a key={s.name} href={`#${s.name}`} onClick={(e) => jump(e, s.name)} className={active === s.name ? 'on' : ''}>{s.name}</a>)}
            </nav>
          );
        })}
        <footer className="g-foot">
          <a className="g-made" href="https://iamjustjack.de" target="_blank" rel="noreferrer">Made with ❤️ by Jack</a>
          <div className="g-legal">
            <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT-Lizenz</a>
            <a href="/llms.txt">Für Agents</a>
            <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <small>&copy; 2026 Jack Feuchte. Frei nutzbar, ein Link zurück ist gern gesehen.</small>
        </footer>
      </aside>
      <main className="g-main">
        <header className="g-head">
          <Kicker>torn paper, pastels, polaroids</Kicker>
          <Heading level={1} size="xl">Paper Pop<em>.</em></Heading>
          <p>{STORIES.length} Komponenten. Klick dich durch, alles ist live.</p>
          <a className="g-btn" href={REPO} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={GH_ICON} fill="currentColor" /></svg>
            Paper Pop auf GitHub
          </a>
          <nav className="g-cats" aria-label="Kategorien">
            {CATEGORIES.map((c) => {
              const n = list.filter((s) => s.category === c).length;
              return n ? <a key={c} className="g-btn" href={`#cat-${c}`} onClick={(e) => goCategory(e, c)}>{c} <span>{n}</span></a> : null;
            })}
          </nav>
        </header>
        {CATEGORIES.map((c) => {
          const items = list.filter((s) => s.category === c);
          if (!items.length) return null;
          return (
            <section key={c} id={`cat-${c}`} className="g-cat">
              <Heading size="md">{c}</Heading>
              {items.map((s) => (
                <Card key={s.name} story={s} />
              ))}
            </section>
          );
        })}
      </main>
    </div>
  );
}

function OgCard() {
  const chips = ['pink', 'butter', 'mint', 'sky', 'lilac'];
  return (
    <div id="og" className="g-og">
      <div className="g-og-tape" aria-hidden="true" />
      <div className="g-og-text">
        <Kicker>torn paper, pastels, polaroids</Kicker>
        <h1 className="pp-display">Paper Pop<em>.</em></h1>
        <p>{STORIES.length} React-Komponenten für Landingpages, Dashboards, Foren und Apps.</p>
        <span className="g-og-url">paperpop.iamjustjack.de</span>
      </div>
      <div className="g-og-stack" aria-hidden="true">
        {chips.map((c, i) => <div key={c} className="g-og-sheet" style={{ background: `var(--pp-${c})`, transform: `rotate(${(i - 2) * 7}deg) translate(${(i - 2) * 34}px, ${Math.abs(i - 2) * 10}px)` }} />)}
      </div>
    </div>
  );
}

function App() {
  if (params.has('og')) return <OgCard />;
  if (only) {
    document.title = docTitle(only);
    const s = STORIES.find((x) => x.name === only);
    return s ? <div className="g-solo"><Stage story={s} solo /></div> : <p>Unknown story {only}</p>;
  }
  return <Gallery />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
