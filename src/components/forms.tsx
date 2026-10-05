// Made by Jack (iamjustjack.de)
import {
  createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type ChangeEvent, type DragEvent, type HTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactNode,
  type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react';
import { cx, vars } from '../lib/util';
import type { PaperColor } from '../types';
import { Icon } from './Icon';

const FieldCtx = createContext<{ id: string; describedBy?: string; invalid: boolean } | null>(null);
function useField(id?: string) {
  const f = useContext(FieldCtx);
  return { id: id ?? f?.id, 'aria-describedby': f?.describedBy, 'aria-invalid': f?.invalid || undefined };
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Label text (small caps above the input). */
  label: ReactNode;
  /** Helper text under the input. */
  hint?: ReactNode;
  /** Error message - replaces the hint and marks the input invalid. */
  error?: ReactNode;
  /** Adds a pink asterisk to the label. */
  required?: boolean;
}

/** Label + input + hint/error. Inputs inside pick up id and aria wiring automatically. */
export function Field({ label, hint, error, required, className, children, ...rest }: FieldProps) {
  const id = useId();
  const noteId = hint || error ? `${id}-note` : undefined;
  return (
    <FieldCtx.Provider value={{ id, describedBy: noteId, invalid: !!error }}>
      <div className={cx('pp-field', error && 'pp-field-error', className)} {...rest}>
        <label htmlFor={id} className="pp-label">{label}{required && <span className="pp-req" aria-hidden="true"> *</span>}</label>
        {children}
        {(error || hint) && <p id={noteId} className="pp-field-note" role={error ? 'alert' : undefined}>{error || hint}</p>}
      </div>
    </FieldCtx.Provider>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Look of the input: underlined (on paper) or boxed (in apps/dashboards). @default 'line' */
  variant?: 'line' | 'box';
}

/** Text input. "line" is an ink underline like the contact form; "box" is a bordered field. */
export function Input({ variant = 'line', className, id, ...rest }: InputProps) {
  return <input className={cx('pp-input', `pp-input-${variant}`, className)} {...useField(id)} {...rest} />;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Ruled notebook lines behind the text. @default true */
  ruled?: boolean;
}

/** Multi-line input that writes on notebook lines. */
export function Textarea({ ruled = true, className, id, ...rest }: TextareaProps) {
  return <textarea className={cx('pp-textarea', ruled && 'pp-textarea-ruled', className)} {...useField(id)} {...rest} />;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label next to the box. */
  label: ReactNode;
}

/** Hand-drawn checkbox with a pink tick. */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx('pp-check', className)}>
      <input type="checkbox" {...rest} />
      <span className="pp-check-box" aria-hidden="true">
        <svg viewBox="0 0 30 30"><path d="M5 15 L12 23 L27 3" pathLength={1} /></svg>
      </span>
      <span className="pp-check-label">{label}</span>
    </label>
  );
}

export interface RadioGroupProps<T extends string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Shared name of the radios. */
  name: string;
  /** Options as values or { value, label }. */
  options: Array<T | { value: T; label: ReactNode }>;
  /** Selected value. */
  value?: T;
  /** Called with the new value. */
  onChange?: (value: T) => void;
  /** Lay out horizontally. */
  inline?: boolean;
}

/** A group of round, hand-drawn radio buttons. */
export function RadioGroup<T extends string>({ name, options, value, onChange, inline, className, ...rest }: RadioGroupProps<T>) {
  return (
    <div role="radiogroup" className={cx('pp-radios', inline && 'pp-radios-inline', className)} {...rest}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return (
          <label key={opt.value} className="pp-radio">
            <input type="radio" name={name} value={opt.value} checked={value === undefined ? undefined : value === opt.value} onChange={() => onChange?.(opt.value)} />
            <span className="pp-radio-dot" aria-hidden="true" />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Label next to the switch. */
  label?: ReactNode;
  /** Track colour when on. @default 'mint' */
  color?: PaperColor;
}

/** On/off toggle with a chunky knob. */
export function Switch({ label, color = 'mint', className, ...rest }: SwitchProps) {
  return (
    <label className={cx('pp-switch', `pp-c-${color}`, className)}>
      <input type="checkbox" role="switch" {...rest} />
      <span className="pp-switch-track" aria-hidden="true"><span className="pp-switch-knob" /></span>
      {label && <span>{label}</span>}
    </label>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Options as values or { value, label }. Alternatively pass <option> children. */
  options?: Array<string | { value: string; label: string }>;
  /** Placeholder shown as a disabled first option. */
  placeholder?: string;
}

interface SelectItem { value: string; label: string; disabled: boolean }

/**
 * Custom dropdown on top of a hidden native `<select>`, so `value`, `onChange`, `name`, `required` and forms keep working.
 * Keyboard: arrows, Home/End, Enter/Space, Escape, type-ahead.
 */
export function Select({ options, placeholder, className, children, id, ...rest }: SelectProps) {
  const field = useField(id);
  const native = useRef<HTMLSelectElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [active, setActive] = useState(0);
  const [items, setItems] = useState<SelectItem[]>([]);
  const [current, setCurrent] = useState({ value: '', label: '' });
  const typed = useRef({ text: '', at: 0 });

  const read = (): SelectItem[] => Array.from(native.current?.options ?? []).map((o) => ({ value: o.value, label: o.text, disabled: o.disabled }));
  const sync = () => {
    const sel = native.current;
    if (!sel) return;
    const next = { value: sel.value, label: sel.selectedOptions[0]?.text ?? '' };
    setCurrent((c) => (c.value === next.value && c.label === next.label ? c : next));
  };
  useLayoutEffect(sync);

  const step = (from: number, dir: 1 | -1, list = items) => {
    for (let i = from + dir; i >= 0 && i < list.length; i += dir) if (!list[i]!.disabled) return i;
    return from;
  };
  const show = () => {
    const list = read();
    setItems(list);
    const at = list.findIndex((o) => o.value === current.value && !o.disabled);
    setActive(at >= 0 ? at : step(-1, 1, list));
    const r = root.current?.getBoundingClientRect();
    setUp(!!r && window.innerHeight - r.bottom < 280 && r.top > window.innerHeight - r.bottom);
    setOpen(true);
  };
  const choose = (list: SelectItem[], i: number) => {
    const o = list[i];
    const sel = native.current;
    if (!o || o.disabled || !sel) return;
    if (sel.value !== o.value) {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(sel, o.value);
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setCurrent({ value: o.value, label: o.label });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);
  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const list = open ? items : read();
    if (e.key === 'Tab') { setOpen(false); return; }
    if (e.key === 'Escape') { if (open) { e.preventDefault(); e.stopPropagation(); setOpen(false); } return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') show();
        return;
      }
      if (e.key === 'ArrowDown') setActive((a) => step(a, 1));
      else if (e.key === 'ArrowUp') setActive((a) => step(a, -1));
      else if (e.key === 'Home') setActive(step(-1, 1));
      else if (e.key === 'End') setActive(step(list.length, -1));
      else choose(list, active);
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typed.current;
      const now = Date.now();
      t.text = now - t.at > 700 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
      t.at = now;
      const from = open ? active : list.findIndex((o) => o.value === current.value);
      const order = [...list.keys()].map((_, i) => ((from + (t.text.length > 1 ? 0 : 1) + i) % list.length + list.length) % list.length);
      const hit = order.find((i) => !list[i]!.disabled && list[i]!.label.toLowerCase().startsWith(t.text));
      if (hit === undefined) return;
      if (open) setActive(hit); else choose(list, hit);
    }
  };

  const showing = current.value !== '' ? current.label : placeholder ?? current.label;
  return (
    <span ref={root} className={cx('pp-select', open && 'pp-select-open', up && 'pp-select-up', className)}>
      <select ref={native} className="pp-select-native" tabIndex={-1} aria-hidden="true" defaultValue={rest.value === undefined && placeholder ? '' : undefined} {...rest}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options?.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
        {children}
      </select>
      <button
        type="button" id={field.id} className={cx('pp-select-btn', current.value === '' && placeholder && 'pp-select-empty')}
        role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-describedby={field['aria-describedby']} aria-invalid={field['aria-invalid']} disabled={rest.disabled}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKeyDown}
      >
        <span>{showing || '\u00a0'}</span>
        <Icon name="chevron-down" size={18} stroke={3} />
      </button>
      {open && (
        <ul id={listId} className="pp-select-list" role="listbox" tabIndex={-1}>
          {items.map((o, i) => (
            <li
              key={o.value} id={`${listId}-${i}`} role="option" aria-selected={o.value === current.value} aria-disabled={o.disabled || undefined}
              className={cx(i === active && 'pp-select-active', o.disabled && 'pp-select-off')}
              onPointerEnter={() => !o.disabled && setActive(i)} onClick={() => choose(items, i)}
            >
              {o.label}
              {o.value === current.value && <Icon name="check" size={16} stroke={3} />}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Current value (controlled). */
  value: number;
  /** Called with the new number. */
  onChange: (value: number) => void;
  /** Minimum. @default 0 */
  min?: number;
  /** Maximum. @default 100 */
  max?: number;
  /** Show the value in a little tag next to the slider. @default true */
  showValue?: boolean;
  /** Format the shown value. */
  format?: (v: number) => ReactNode;
}

/** Range slider with a washi tape fill. */
export function Slider({ value, onChange, min = 0, max = 100, showValue = true, format = String, className, id, ...rest }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <span className={cx('pp-slider', className)} style={vars({ '--pct': `${pct}%` })}>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} {...useField(id)} {...rest} />
      {showValue && <output className="pp-slider-value">{format(value)}</output>}
    </span>
  );
}

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Current query (controlled). */
  value: string;
  /** Called with the new query. */
  onChange: (value: string) => void;
  /** Shows a keyboard hint like "/" on the right. */
  shortcut?: string;
}

/** Rounded search field with icon and clear button. */
export function SearchInput({ value, onChange, shortcut, placeholder = 'Suchen …', className, id, ...rest }: SearchInputProps) {
  return (
    <span className={cx('pp-search', className)}>
      <Icon name="search" size={19} />
      <input type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-label={rest['aria-label'] ?? placeholder} {...useField(id)} {...rest} />
      {value ? (
        <button type="button" aria-label="Leeren" onClick={() => onChange('')}><Icon name="x" size={16} stroke={3} /></button>
      ) : shortcut ? <kbd className="pp-kbd">{shortcut}</kbd> : null}
    </span>
  );
}

export interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current rating. */
  value: number;
  /** Called with the new rating. Omit for a read-only display. */
  onChange?: (value: number) => void;
  /** Number of hearts. @default 5 */
  max?: number;
  /** Symbol. @default 'heart' */
  icon?: 'heart' | 'star';
  /** Accessible label. @default 'Bewertung' */
  label?: string;
}

/** Heart (or star) rating - interactive or read-only. */
export function Rating({ value, onChange, max = 5, icon = 'heart', label = 'Bewertung', className, ...rest }: RatingProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const readOnly = !onChange;
  return (
    <div className={cx('pp-rating', readOnly && 'pp-rating-ro', className)} role={readOnly ? 'img' : 'radiogroup'} aria-label={readOnly ? `${label}: ${value} von ${max}` : label} onMouseLeave={() => setHover(0)} {...rest}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const on = n <= shown;
        const glyph = <Icon name={on ? icon : (`${icon}-outline` as const)} size={26} />;
        return readOnly ? (
          <span key={n} className={cx(on && 'on')}>{glyph}</span>
        ) : (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} von ${max}`} className={cx(on && 'on')} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
            {glyph}
          </button>
        );
      })}
    </div>
  );
}

export interface FileDropProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange' | 'onDrop' | 'title'> {
  /** Called with the chosen or dropped files. */
  onFiles: (files: File[]) => void;
  /** accept attribute of the hidden input, e.g. "image/*". */
  accept?: string;
  /** Allow several files. */
  multiple?: boolean;
  /** Main text. @default 'Datei hier ablegen' */
  title?: ReactNode;
  /** Small text under the title. @default 'oder klicken zum Auswählen' */
  hint?: ReactNode;
}

/** Drop zone with a dashed "cut here" border. Click or drag files onto it; chosen files show up as little previews that can be removed again. */
export function FileDrop({ onFiles, accept, multiple, title = 'Datei hier ablegen', hint = 'oder klicken zum Auswählen', className, ...rest }: FileDropProps) {
  const [over, setOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)), [files]);
  useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);
  const commit = (next: File[]) => { setFiles(next); onFiles(next); };
  const take = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const added = Array.from(list);
    commit(multiple ? [...files, ...added.filter((a) => !files.some((f) => f.name === a.name && f.size === a.size))] : added.slice(0, 1));
    if (input.current) input.current.value = '';
  };
  const ext = (f: File) => (f.name.includes('.') ? f.name.split('.').pop()!.slice(0, 4).toUpperCase() : 'FILE');
  return (
    <div className="pp-drop-wrap">
      <label
        className={cx('pp-drop', over && 'pp-drop-over', className)}
        onDragOver={(e: DragEvent) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e: DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
        {...rest}
      >
        <input ref={input} type="file" accept={accept} multiple={multiple} onChange={(e: ChangeEvent<HTMLInputElement>) => take(e.target.files)} />
        <span className="pp-drop-icon"><Icon name="upload" size={28} /></span>
        <b className="pp-display">{title}</b>
        <small>{hint}</small>
      </label>
      {files.length > 0 && (
        <ul className="pp-drop-files" aria-label="Ausgewählte Dateien">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} style={vars({ '--r': `${((i * 7) % 5) - 2}deg` })}>
              {previews[i] ? <img src={previews[i]!} alt="" /> : <span className="pp-drop-ext pp-display">{ext(f)}</span>}
              <span className="pp-drop-name" title={f.name}>{f.name}</span>
              <button type="button" aria-label={`${f.name} entfernen`} onClick={() => commit(files.filter((_, j) => j !== i))}><Icon name="x" size={12} stroke={3.5} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface NumberStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current value. */
  value: number;
  /** Called with the new value. */
  onChange: (value: number) => void;
  /** Minimum. @default 0 */
  min?: number;
  /** Maximum. @default Infinity */
  max?: number;
  /** Step size. @default 1 */
  step?: number;
  /** Accessible label. @default 'Anzahl' */
  label?: string;
}

/** Minus / value / plus - for quantities and counters. Click the number to type a value yourself. */
export function NumberStepper({ value, onChange, min = 0, max = Infinity, step = 1, label = 'Anzahl', className, ...rest }: NumberStepperProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const set = (v: number) => onChange(clamp(v));
  const commit = () => {
    if (draft !== null) {
      const n = Number(draft.replace(',', '.'));
      if (draft.trim() !== '' && Number.isFinite(n)) set(n);
    }
    setDraft(null);
  };
  const text = draft ?? String(value);
  return (
    <div className={cx('pp-stepper', className)} role="group" aria-label={label} {...rest}>
      <button type="button" aria-label="Weniger" disabled={value <= min} onClick={() => set(value - step)}><Icon name="minus" size={18} stroke={3} /></button>
      <input
        className="pp-stepper-input" type="text" inputMode="decimal" aria-label={`${label} eingeben`} value={text} style={{ width: `${Math.max(2, text.length) + 1}ch` }}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => { if (/^-?\d*[.,]?\d*$/.test(e.target.value)) setDraft(e.target.value); }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { commit(); e.currentTarget.blur(); }
          else if (e.key === 'Escape') { setDraft(null); e.currentTarget.blur(); }
          else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setDraft(null); set((draft !== null && Number.isFinite(Number(draft)) && draft !== '' ? Number(draft) : value) + (e.key === 'ArrowUp' ? step : -step)); }
        }}
      />
      <button type="button" aria-label="Mehr" disabled={value >= max} onClick={() => set(value + step)}><Icon name="plus" size={18} stroke={3} /></button>
    </div>
  );
}
