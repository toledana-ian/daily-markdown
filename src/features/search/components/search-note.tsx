import { RiCloseLine, RiSearchLine } from '@remixicon/react';
import { Input } from '@/components/ui/input.tsx';

interface SearchNoteProps {
  query: string;
  setQuery: (query: string) => void;
  onClear?: () => void;
}

export const SearchNote = (props: SearchNoteProps) => {
  const { query, setQuery, onClear } = props;

  return (
    <div className='relative'>
      <RiSearchLine
        aria-hidden='true'
        className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
      />
      <Input
        type='text'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder='Search notes'
        aria-label='Search notes'
        className='bg-background/80 pl-9 pr-9 focus-visible:ring-0'
      />
      {query && (
        <button
          type='button'
          aria-label='Clear search'
          onClick={() => {
            setQuery('');
            onClear?.();
          }}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        >
          <RiCloseLine className='size-4' />
        </button>
      )}
    </div>
  );
};
