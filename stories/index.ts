// Made by Jack (iamjustjack.de)
import apps from './apps.stories';
import buttons from './buttons.stories';
import dashboard from './dashboard.stories';
import feedback from './feedback.stories';
import forms from './forms.stories';
import forum from './forum.stories';
import foundations from './foundations.stories';
import landing from './landing.stories';
import layout from './layout.stories';
import navigation from './navigation.stories';
import type { Story } from './types';

/** Every story, in category order. Story files live in stories/<category>.stories.tsx. */
export const STORIES: Story[] = [...foundations, ...buttons, ...forms, ...feedback, ...navigation, ...layout, ...dashboard, ...landing, ...forum, ...apps];
