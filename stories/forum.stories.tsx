// Made by Jack (iamjustjack.de)
import { useState } from 'react';
import { CategoryCard, Comment, Composer, Pill, Post, Reactions, ThreadCard, UserCard, VoteButtons } from '../src';
import { story } from './types';

export default [
  story({
    name: 'ThreadCard',
    category: 'Forum',
    description: 'Forum thread in a list: votes, category, title, excerpt, tags, participants and counters.',
    width: 860,
    example: () => (
      <div style={{ display: 'grid', gap: 18 }}>
        <ThreadCard pinned title="Willkommen! Bitte zuerst lesen" href="#t1" author="Jack" time="vor 3 Tagen" category={{ label: 'Ankündigung', color: 'pink' }} replies={24} views={1200} />
        <ThreadCard score={42} solved title="Server startet nach Update nicht mehr" href="#t2" author="Kim" time="vor 2 Std."
          excerpt="Seit dem Update auf 1.21 hängt der Start bei Loading libraries. Hat jemand eine Idee, woran das liegen kann?"
          category={{ label: 'Hilfe', color: 'sky' }} tags={['paper', 'plugins']} replies={8} views={214} participants={['Boby', 'Alex', 'Sam']} />
      </div>
    ),
  }),
  story({
    name: 'Post',
    category: 'Forum',
    description: 'Full forum post with author header, role badge, body, reactions and actions; can be marked as best answer.',
    width: 760,
    example: () => (
      <Post author="Boby" role="Mod" time="vor 40 Min." accepted
        reactions={[{ icon: 'heart', label: 'Herz', count: 12, active: true }, { icon: 'fire', label: 'Feuer', count: 4 }, { icon: 'sparkle', label: 'Glitzer', count: 2 }]}
        actions={<><Pill small icon="chat">Antworten</Pill><Pill small icon="flag">Melden</Pill></>}>
        <p>Lösch mal den Ordner <code>libraries</code> und starte neu. Der Download war vermutlich kaputt.</p>
      </Post>
    ),
  }),
  story({
    name: 'Comment',
    category: 'Forum',
    description: 'Threaded comments with a dashed reply line - nest Comments as children.',
    width: 640,
    example: () => (
      <Comment author="Kim" time="vor 1 Std." text="Hat bei mir auch geholfen, danke!" likes={3} onReply={() => {}} op>
        <Comment author="Boby" time="vor 50 Min." text="Gern! Sag Bescheid, wenn noch was ist." likes={1} onReply={() => {}}>
          <Comment author="Kim" time="vor 45 Min." text="Läuft alles ♥" op />
        </Comment>
      </Comment>
    ),
  }),
  story({
    name: 'VoteButtons',
    category: 'Forum',
    description: 'Up/down voting with a bouncy score, vertical or horizontal.',
    animation: { steps: [{ wait: 300 }, { click: '.pp-votes button[aria-label=Upvote]' }, { wait: 700 }] },
    example: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
        <VoteButtons score={41} />
        <VoteButtons score={7} horizontal />
      </div>
    ),
  }),
  story({
    name: 'Reactions',
    category: 'Forum',
    description: 'Toggleable reaction chips with counts.',
    animation: { steps: [{ wait: 300 }, { click: '.pp-reactions button:nth-child(2)' }, { wait: 600 }] },
    example: () => (
      <Reactions items={[
        { icon: 'heart', label: 'Herz', count: 12, active: true },
        { icon: 'fire', label: 'Feuer', count: 4 },
        { icon: 'thumbs-up', label: 'Daumen', count: 9 },
        { icon: 'sparkle', label: 'Glitzer', count: 1 },
      ]} />
    ),
  }),
  story({
    name: 'Composer',
    category: 'Forum',
    description: 'Reply box with live markdown formatting, toolbar, preview, character counter and send button.',
    notes: 'While you type, `**bold**`, `_italic_`, `` `code` `` and `[links](https://)` are formatted in place with the markers greyed out. The toolbar (and Ctrl/Cmd+B, Ctrl/Cmd+I) wraps the selection and keeps the cursor in the box so you can carry on typing; Ctrl/Cmd+Enter sends. The eye button shows the finished result.',
    width: 640,
    example: function Example() {
      const [last, setLast] = useState('');
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <Composer user="Jack" onSubmit={(text) => setLast(text)} />
          {last && <small>Gesendet: {last}</small>}
        </div>
      );
    },
  }),
  story({
    name: 'UserCard',
    category: 'Forum',
    description: 'Profile card with polaroid avatar, badges, bio, stats and actions.',
    width: 420,
    example: () => (
      <UserCard name="Jack" handle="@iamjustjack" bio="Entwickler, Ex-DVN, baut gern Sachen aus Papier und Code."
        badges={[{ label: 'Admin', color: 'pink' }, { label: 'Gründer', color: 'butter' }]}
        stats={[{ label: 'Beiträge', value: 128 }, { label: 'Likes', value: '1.2k' }, { label: 'Jahre', value: 8 }]}
        actions={<><button type="button" className="pp-btn pp-btn-sm">Folgen</button><Pill small icon="mail">Nachricht</Pill></>} />
    ),
  }),
  story({
    name: 'CategoryCard',
    category: 'Forum',
    description: 'Board/category tile with icon, description and thread/post counters.',
    width: 720,
    example: () => (
      <div style={{ display: 'grid', gap: 16 }}>
        <CategoryCard href="#help" icon="info" title="Hilfe & Support" description="Fragen zu Server, Plugins und Accounts." threads={312} posts={2140} />
        <CategoryCard href="#show" icon="image" color="pink" title="Show & Tell" description="Zeig, was du gebaut hast." threads={88} posts={940} />
      </div>
    ),
  }),
];
