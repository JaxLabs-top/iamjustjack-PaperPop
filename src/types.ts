// Made by Jack (iamjustjack.de)
/** The Paper Pop palette. */
export type PaperColor = 'paper' | 'pink' | 'butter' | 'mint' | 'sky' | 'lilac';
/** Palette plus ink (dark) for strong accents. */
export type Tone = PaperColor | 'ink';
export type Size = 'sm' | 'md' | 'lg';

/**
 * Torn-edge shapes. "big" for large sheets, "card" for cards, "chip" for small pills,
 * one-sided shapes (top, bottom, foot, l, r, lr) for strips that touch the page edge or other sheets.
 */
export type TornEdge =
  | 'big-1' | 'big-2' | 'big-3'
  | 'card-1' | 'card-2' | 'card-3' | 'card-4' | 'card-5'
  | 'chip-1' | 'chip-2'
  | 'top-1' | 'top-2' | 'bottom-1' | 'bottom-2' | 'tb-1'
  | 'foot-1' | 'foot-2'
  | 'l-1' | 'l-2' | 'r-1' | 'r-2' | 'lr-1' | 'lr-2';

export const PAPER_COLORS: PaperColor[] = ['paper', 'pink', 'butter', 'mint', 'sky', 'lilac'];
