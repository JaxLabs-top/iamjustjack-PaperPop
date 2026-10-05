// Made by Jack (iamjustjack.de)
import type { ReactNode } from 'react';

export const CATEGORIES = [
  'Foundations',
  'Buttons',
  'Forms',
  'Feedback',
  'Navigation',
  'Layout',
  'Dashboard',
  'Landing',
  'Forum',
  'Apps',
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * One step of a recorded animation. Selectors are resolved inside the story stage.
 * The recorder captures frames continuously while steps run.
 */
export type Step =
  | { hover: string }
  | { leave: true }
  | { click: string }
  | { focus: string }
  | { type: string; text: string }
  | { wait: number };

export interface Story {
  /** Component name - also the doc file name (docs/components/<name>.md). */
  name: string;
  category: Category;
  /** One sentence for the README and the MCP server. */
  description: string;
  /** Optional markdown with usage notes, shown in the component doc. */
  notes?: string;
  /** Exports documented on this page; their `<Export>Props` interfaces become prop tables. Defaults to [name]. */
  exports?: string[];
  /** Stage width in px for the screenshot. @default 720 */
  width?: number;
  /** Stage min height in px. */
  height?: number;
  /**
   * Capture the whole viewport instead of the stage - for things that render fixed
   * to the window (modals, drawers, toasts, banners).
   */
  viewport?: { width: number; height: number };
  /**
   * Set when the component moves. The docs get a GIF instead of a PNG.
   * `steps` default to just waiting `duration` ms (for animations that run on their own).
   */
  animation?: { duration?: number; steps?: Step[]; fps?: number };
  /** The example. Its source is copied into the docs as the usage snippet - keep it self-contained. */
  example: () => ReactNode;
}

export const story = (s: Story) => s;
