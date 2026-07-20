import { useEffect, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { RiArrowLeftLine } from '@remixicon/react';
import { Markdown } from '@/components/common/markdown';
import { buttonVariants } from '@/components/ui/button-variants';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase/client.ts';
import { cn } from '@/lib/utils';

type SharedNoteState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'ready'; content: string };

export const SharedNotePage = () => {
  const { shareId } = useParams({ from: '/_public/share/$shareId' });
  const [state, setState] = useState<SharedNoteState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    const loadSharedNote = async () => {
      setState({ status: 'loading' });

      const { data, error } = await supabase.rpc('get_shared_note_content', {
        share_token: shareId,
      });

      if (cancelled) return;

      const row = Array.isArray(data) ? data[0] : data;

      if (error || !row || typeof row.content !== 'string') {
        setState({ status: 'not_found' });
        return;
      }

      setState({ status: 'ready', content: row.content });
    };

    loadSharedNote().then();

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  if (state.status === 'loading') {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <p className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Spinner />
          Loading shared note…
        </p>
      </div>
    );
  }

  if (state.status === 'not_found') {
    return (
      <div className='mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center'>
        <h1 className='text-xl font-semibold'>Shared note unavailable</h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          This link is invalid or has expired. Ask the owner to share the note again.
        </p>
        <Link
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mt-6 gap-1.5')}
          to='/landing'
        >
          <RiArrowLeftLine className='size-4' />
          Go to home
        </Link>
      </div>
    );
  }

  return (
    <article className='mx-auto max-w-3xl px-6 py-10'>
      <Markdown content={state.content} emptyMessage='This shared note is empty.' />
    </article>
  );
};
