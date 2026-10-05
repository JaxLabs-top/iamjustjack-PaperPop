// Made by Jack (iamjustjack.de)
import { useState } from 'react';
import { Checkbox, Field, FileDrop, Input, NumberStepper, RadioGroup, Rating, SearchInput, Select, Slider, Switch, Textarea } from '../src';
import { story } from './types';

export default [
  story({
    name: 'Field',
    category: 'Forms',
    description: 'Label, input and hint/error in one - wires id and aria attributes automatically.',
    width: 560,
    example: () => (
      <div style={{ display: 'grid', gap: 24 }}>
        <Field label="Name" required hint="So, wie ich dich nennen soll.">
          <Input placeholder="z.B. Kim" />
        </Field>
        <Field label="E-Mail" error="Das sieht nicht nach einer E-Mail aus.">
          <Input variant="box" defaultValue="kim@" />
        </Field>
      </div>
    ),
  }),
  story({
    name: 'Input',
    category: 'Forms',
    description: 'Text input: ink underline on paper ("line") or a bordered box for apps ("box").',
    width: 560,
    example: () => (
      <div style={{ display: 'grid', gap: 24 }}>
        <Input placeholder="line: du@irgendwo.de" type="email" />
        <Input variant="box" placeholder="box: Projektname" />
      </div>
    ),
  }),
  story({
    name: 'Textarea',
    category: 'Forms',
    description: 'Multi-line input that writes on ruled notebook lines.',
    width: 560,
    example: () => (
      <Textarea placeholder="Hey Jack, …" defaultValue={'Hey Jack,\nich hätte da eine Idee …'} />
    ),
  }),
  story({
    name: 'Checkbox',
    category: 'Forms',
    description: 'Hand-drawn checkbox with a pink tick that draws itself.',
    animation: { steps: [{ wait: 300 }, { click: 'label:nth-child(2)' }, { wait: 600 }] },
    example: () => (
      <div style={{ display: 'grid', gap: 14 }}>
        <Checkbox label="Newsletter abonnieren" defaultChecked />
        <Checkbox label="Ich habe die Datenschutzerklärung gelesen" />
        <Checkbox label="Deaktiviert" disabled />
      </div>
    ),
  }),
  story({
    name: 'RadioGroup',
    category: 'Forms',
    description: 'Round hand-drawn radio buttons, vertical or inline.',
    animation: { steps: [{ wait: 300 }, { click: 'label:nth-child(3)' }, { wait: 600 }] },
    example: function Example() {
      const [size, setSize] = useState('M');
      return <RadioGroup name="size" inline options={['S', 'M', 'L', 'XL']} value={size} onChange={setSize} />;
    },
  }),
  story({
    name: 'Switch',
    category: 'Forms',
    description: 'On/off toggle with a bouncy knob.',
    animation: { steps: [{ wait: 300 }, { click: 'label:nth-child(1)' }, { wait: 600 }] },
    example: () => (
      <div style={{ display: 'grid', gap: 14 }}>
        <Switch label="Dunkler Modus" />
        <Switch label="Benachrichtigungen" defaultChecked color="pink" />
        <Switch label="Deaktiviert" disabled />
      </div>
    ),
  }),
  story({
    name: 'Select',
    category: 'Forms',
    description: 'Custom dropdown with full keyboard support (arrows, Home/End, Enter, Escape, type-ahead) on top of a native select.',
    notes: 'A hidden native `<select>` stays underneath, so `value`, `onChange`, `name`, `required` and form submission work as usual.',
    height: 260,
    example: () => <Select placeholder="Kategorie wählen" options={['Allgemein', 'Hilfe', 'Show & Tell']} />,
  }),
  story({
    name: 'Slider',
    category: 'Forms',
    description: 'Range slider with a washi tape fill and a value tag.',
    width: 560,
    example: function Example() {
      const [v, setV] = useState(64);
      return <Slider value={v} onChange={setV} format={(n) => `${n}%`} aria-label="Lautstärke" />;
    },
  }),
  story({
    name: 'SearchInput',
    category: 'Forms',
    description: 'Rounded search field with icon, clear button and shortcut hint.',
    width: 560,
    example: function Example() {
      const [q, setQ] = useState('');
      return <SearchInput value={q} onChange={setQ} shortcut="/" placeholder="Beiträge durchsuchen …" />;
    },
  }),
  story({
    name: 'Rating',
    category: 'Forms',
    description: 'Heart or star rating - interactive or read-only.',
    animation: { steps: [{ wait: 200 }, { hover: '.pp-rating button:nth-child(4)' }, { wait: 400 }, { click: '.pp-rating button:nth-child(4)' }, { wait: 500 }] },
    example: function Example() {
      const [v, setV] = useState(2);
      return (
        <div style={{ display: 'grid', gap: 14 }}>
          <Rating value={v} onChange={setV} />
          <Rating value={4} icon="star" />
        </div>
      );
    },
  }),
  story({
    name: 'FileDrop',
    category: 'Forms',
    description: 'Dashed drop zone: click or drag files onto it, chosen files appear as removable previews.',
    width: 560,
    example: () => <FileDrop accept="image/*" multiple onFiles={(files) => console.log(files)} />,
  }),
  story({
    name: 'NumberStepper',
    category: 'Forms',
    description: 'Minus / value / plus for quantities - click the number to type one.',
    animation: { steps: [{ wait: 300 }, { click: 'button[aria-label=Mehr]' }, { wait: 300 }, { click: 'button[aria-label=Mehr]' }, { wait: 400 }] },
    example: function Example() {
      const [n, setN] = useState(1);
      return <NumberStepper value={n} onChange={setN} min={0} max={9} />;
    },
  }),
];
