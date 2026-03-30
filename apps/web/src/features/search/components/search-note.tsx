import { RiSearchLine } from '@remixicon/react';
import { Input } from '@/components/ui/input.tsx';

interface SearchNoteProps {
  query: string;
  setQuery: (query: string) => void;
}

export const SearchNote = (props: SearchNoteProps) => {
  const { query, setQuery } = props;

  return (
    <>
      <div className='relative'>
        <RiSearchLine
          aria-hidden='true'
          className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
        />
        <Input
          type='search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Search notes'
          aria-label='Search notes'
          className='bg-background/80 pl-9 focus-visible:ring-0'
        />
      </div>
    </>
  );
};
