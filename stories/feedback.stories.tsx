// Made by Jack (iamjustjack.de)
import { useState } from 'react';
import {
  Alert, Badge, Button, ConsentBanner, EmptyState, Modal, Pill, Progress, Skeleton, Spinner, Tag, Toast, Tooltip, useToast,
} from '../src';
import { story } from './types';

export default [
  story({
    name: 'Alert',
    category: 'Feedback',
    description: 'Taped-on note for info, success, warning and error messages - optionally closable.',
    width: 640,
    example: () => (
      <div style={{ display: 'grid', gap: 18 }}>
        <Alert title="Gut zu wissen">Das Formular lädt Turnstile erst nach deiner Zustimmung.</Alert>
        <Alert status="success" title="Gespeichert!" tilt={0.6} onClose={() => {}} />
        <Alert status="warning" title="Fast voll">Noch 2 von 50 Plätzen frei.</Alert>
        <Alert status="error" title="Hat nicht geklappt" tilt={0.4}>Versuch es gleich nochmal oder schreib mir direkt.</Alert>
      </div>
    ),
  }),
  story({
    name: 'Toast',
    category: 'Feedback',
    description: 'Little notes that slide in from the corner. Wrap the app in ToastProvider, then call useToast().',
    exports: ['ToastProvider', 'Toast'],
    notes: '```tsx\n// main.tsx\n<ToastProvider position="bottom-right"><App /></ToastProvider>\n\n// anywhere\nconst toast = useToast();\ntoast({ title: \'Gespeichert!\', description: \'Alles sicher.\', status: \'success\' });\n```',
    viewport: { width: 760, height: 420 },
    animation: { steps: [{ wait: 200 }, { click: 'button:nth-child(1)' }, { wait: 700 }, { click: 'button:nth-child(2)' }, { wait: 900 }] },
    example: function Example() {
      const toast = useToast();
      return (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <Pill onClick={() => toast({ title: 'Gespeichert!', description: 'Deine Änderungen sind sicher.' })}>Erfolg</Pill>
          <Pill onClick={() => toast({ title: 'Upload fehlgeschlagen', description: 'Datei ist größer als 10 MB.', status: 'error' })}>Fehler</Pill>
          <Toast title="Einzeln nutzbar" description="auch ohne Provider" status="info" />
        </div>
      );
    },
  }),
  story({
    name: 'Badge',
    category: 'Feedback',
    description: 'Small counters and status labels, with dot and pulsing "live" variants.',
    animation: { duration: 1600, fps: 15 },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
        <Badge>3</Badge>
        <Badge color="butter">neu</Badge>
        <Badge color="mint">99+</Badge>
        <Badge color="ink">beta</Badge>
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Badge dot pulse color="pink" /> live</span>
      </div>
    ),
  }),
  story({
    name: 'Tag',
    category: 'Feedback',
    description: 'Chips for tags, filters and categories - optionally with icon and remove button.',
    example: function Example() {
      const [tags, setTags] = useState(['react', 'design', 'minecraft']);
      return (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Tag icon="fire" color="pink">heiß</Tag>
          <Tag color="sky">Frage</Tag>
          {tags.map((t) => <Tag key={t} color="mint" onRemove={() => setTags(tags.filter((x) => x !== t))}>#{t}</Tag>)}
        </div>
      );
    },
  }),
  story({
    name: 'Progress',
    category: 'Feedback',
    description: 'Progress bar filled with rolling washi tape, or indeterminate while loading.',
    width: 560,
    animation: { duration: 2400, fps: 15 },
    example: () => (
      <div style={{ display: 'grid', gap: 22 }}>
        <Progress value={68} label="Profil vollständig" />
        <Progress value={35} fill="mint" label="Speicher" />
        <Progress label="Lädt hoch …" showValue={false} />
      </div>
    ),
  }),
  story({
    name: 'Spinner',
    category: 'Feedback',
    description: 'Three twinkling sparkles circling - the loading indicator.',
    animation: { duration: 1600, fps: 20 },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
        <Spinner />
        <Spinner size={56} showLabel label="Einen Moment …" />
      </div>
    ),
  }),
  story({
    name: 'Skeleton',
    category: 'Feedback',
    description: 'Shimmering placeholders while content loads.',
    width: 520,
    animation: { duration: 1600, fps: 15 },
    example: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center' }}>
        <Skeleton circle width={56} />
        <Skeleton lines={3} />
      </div>
    ),
  }),
  story({
    name: 'Tooltip',
    category: 'Feedback',
    description: 'Tiny sticky-note tooltip on hover and keyboard focus.',
    height: 160,
    animation: { steps: [{ wait: 200 }, { hover: '.pp-tooltip' }, { wait: 700 }] },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'center', paddingTop: 60 }}>
        <Tooltip content="Das ist ein Tooltip ♥"><Pill>Drüberfahren</Pill></Tooltip>
        <Tooltip content="Unten geht auch" side="bottom" color="mint"><Pill>Unten</Pill></Tooltip>
      </div>
    ),
  }),
  story({
    name: 'Modal',
    category: 'Feedback',
    description: 'A paper sheet dropping onto a dimmed page. Escape and backdrop close it.',
    viewport: { width: 860, height: 520 },
    animation: { steps: [{ wait: 200 }, { click: 'button' }, { wait: 900 }] },
    example: function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Löschen …</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Wirklich löschen?"
            actions={<><Button color="pink" onClick={() => setOpen(false)}>Ja, weg damit</Button><Pill onClick={() => setOpen(false)}>Abbrechen</Pill></>}>
            <p>Der Beitrag „Mein erstes Plugin“ und alle 12 Antworten werden gelöscht. Das lässt sich nicht rückgängig machen.</p>
          </Modal>
        </>
      );
    },
  }),
  story({
    name: 'EmptyState',
    category: 'Feedback',
    description: 'Friendly "nothing here yet" block for empty lists, inboxes and search results.',
    width: 560,
    example: () => (
      <EmptyState icon="mail" title="Noch keine Nachrichten" action={<Button size="sm" color="butter">Erste schreiben</Button>}>
        Sobald dir jemand schreibt, landet es hier. Versprochen.
      </EmptyState>
    ),
  }),
  story({
    name: 'ConsentBanner',
    category: 'Feedback',
    description: 'Cookie/consent sticky note in the corner with a dimmed page - you decide where the choice is stored.',
    viewport: { width: 860, height: 460 },
    animation: { steps: [{ wait: 200 }, { click: 'button' }, { wait: 800 }] },
    example: function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Pill onClick={() => setOpen(true)}>Cookie-Einstellungen</Pill>
          <ConsentBanner open={open} onAccept={() => setOpen(false)} onDecline={() => setOpen(false)}>
            <p>Kein Tracking, keine Werbung. Nur fürs Kontaktformular lade ich <strong>Cloudflare Turnstile</strong>.</p>
          </ConsentBanner>
        </>
      );
    },
  }),
];
