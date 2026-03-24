import { NoteCard } from '@/features/notes/components/note-card.tsx';

export const NoteListSection = () => {
  const notes = [
    '### Hello World :D',
    '# Daily Notes\nToday was a productive day. Finished some tasks and went for a run.',
    '## Tasks\n- [ ] Finish feature\n- [x] Fix bug\n- [ ] Review PR',
    '### Idea 💡\nBuild a markdown-based daily journaling app with auto-tagging.',
    '## Workout\n- Run: 5km\n- Push-ups: 50\n- Plank: 2 mins',
    '### Quote\n> "Consistency beats motivation."',
    '## Code Snippet\n```js\nconst hello = () => console.log("Hello World");\n```',
    '### Tags Example\nWorking on #react #supabase #drizzle today.',
    '## Meeting Notes\n- Discussed roadmap\n- Identified blockers\n- Next step: API optimization',
    '### Food Log\n- Breakfast: Oatmeal\n- Lunch: Chicken salad\n- Dinner: Rice + veggies',
    '## Random Thoughts\nSometimes simple solutions are the best.',
    '### Debug Log\nError: Cannot read property of undefined\nFix: Added null check',
    '## Goals\n- Improve running pace\n- Build consistent habits\n- Ship features faster',
    '### Reminder ⏰\nDrink water and take breaks!',
  ];

  return (
    <>
      {notes.map((note, index) => (
        <NoteCard key={index} content={note} />
      ))}
    </>
  );
};
