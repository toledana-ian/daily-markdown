'use client';

import { NoteCard } from '@/features/notes/components/note-card.tsx';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { NoteListTitle } from '@/features/notes/components/note-list-title.tsx';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';

export const NoteListSection = () => {
  const notes = [
    '### Hello World :D',
    '# Daily Notes\nToday was a productive day. Finished some tasks and went for a run.',
    '## Tasks\n- [ ] Finish feature\n- [x] Fix bug\n- [ ] Review PR',
    '### Nested Tasks\n- [ ] Parent Task\n  - [x] Subtask 1\n  - [ ] Subtask 2\n    - [ ] Deep task',
    '## Table Example\n| Feature | Status | Priority |\n|--------|--------|----------|\n| Auth   | Done   | High     |\n| API    | WIP    | Medium   |\n| UI     | Todo   | Low      |',
    '### Aligned Table\n| Name | Age | Role |\n|:-----|:---:|-----:|\n| Chris | 27 | Dev |\n| Alex  | 25 | QA  |',
    '## Code Snippet JS\n```js\nconst greet = (name) => {\n  return `Hello ${name}`;\n};\n```',
    '## Code Snippet Bash\n```bash\nnpm install\nnpm run dev\n```',
    '## Code Snippet JSON\n```json\n{\n  "name": "daily-markdown",\n  "version": "1.0.0"\n}\n```',
    '### Inline Code\nUse `useEffect` carefully to avoid infinite loops.',
    '## Blockquote\n> This is a quote\n>\n> Multi-line supported\n>> Nested quote',
    '### Horizontal Rule\n---\nContent after divider',
    '## Links\n- [Google](https://google.com)\n- [GitHub](https://github.com)',
    '### Image\n![Sample Image](https://picsum.photos/200/100)',
    '## Mermaid Diagram\n```mermaid\ngraph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Do it]\n  B -->|No| D[Skip]\n```',
    '### Callout (Custom Styling Needed)\n> ⚠️ **Warning**\n> This is a warning message block.',
    '## Long Content\n' + 'Lorem ipsum dolor sit amet, '.repeat(50),
    '### Hashtags\nWorking on #react #typescript #tailwind #markdown',
    '## Mixed Content\nHere is a list:\n- Item 1\n- Item 2\n\nAnd a table:\n\n| A | B |\n|---|---|\n| 1 | 2 |',
    '### Escaped Markdown\n\\*This should not be italic\\*',
    '## HTML Inside Markdown\n<div style="color:red">This is raw HTML</div>',
    '### Checklist Edge Cases\n- [ ]\n- [x]\n- [ ] Task with **bold** text',
    '## Emoji Test 😄🔥🚀\nSupports unicode rendering',
    '### Code With Copy Edge Case\n```ts\ninterface User {\n  id: string;\n  name: string;\n}\n```',
    '## Ordered List\n1. First\n2. Second\n3. Third',
    '### Mixed Nested List\n1. Item\n   - Subitem\n   - Subitem\n2. Item 2',
    '## Definition-like (Not native MD)\nTerm\n: Definition',
    '### Keyboard Input\nPress <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy',
    '## Collapsible (if supported)\n<details>\n<summary>Click me</summary>\nHidden content here\n</details>',
    '### Strikethrough\n~~This is removed~~',
    '## Bold & Italic\n**Bold text** and *italic text* and ***both***',
    '### URL Autolink\nhttps://openai.com',
    '## Code Block Without Language\n```\nplain text block\n```',
  ];
  const query = useNoteSearchStore((state) => state.query);
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredNotes = normalizedQuery
    ? notes.filter((note) => note.toLowerCase().includes(normalizedQuery))
    : notes;

  return (
    <>
      <NoteListTitle date={selectedDate} searchValue={query} />

      <div className={'flex gap-2 flex-wrap justify-center'}>
        {filteredNotes.map((note, index) => (
          <NoteCard
            key={`${index}-${note.slice(0, 24)}`}
            content={note}
            onSave={() => {
              console.log(`Saved #${index} note: ${note}`);
            }}
          />
        ))}
      </div>
    </>
  );
};
