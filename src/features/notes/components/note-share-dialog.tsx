import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNoteShare } from '@/features/notes/hooks/use-note-share.ts';
import { SHARE_DURATIONS, type ShareDuration } from '@/features/notes/lib/note-share-expiry.ts';
import { cn } from '@/lib/utils';

type NoteShareDialogProps = {
  content: string;
  noteId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const NoteShareDialog = ({ content, noteId, onOpenChange, open }: NoteShareDialogProps) => {
  const { createNoteShare } = useNoteShare();
  const [duration, setDuration] = useState<ShareDuration>('24h');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const result = await createNoteShare({ noteId, content, duration });
    setIsSubmitting(false);

    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
          <DialogDescription>
            Creates a public snapshot of this note&apos;s current content. The link expires after
            the selected time and will not update if you edit the note later.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium'>Public for</p>
          <div className='grid grid-cols-2 gap-2'>
            {SHARE_DURATIONS.map((option) => (
              <Button
                key={option.value}
                className={cn(duration === option.value && 'ring-2 ring-primary')}
                disabled={isSubmitting}
                onClick={() => setDuration(option.value)}
                type='button'
                variant={duration === option.value ? 'default' : 'outline'}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            type='button'
            variant='outline'
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleConfirm} type='button'>
            {isSubmitting ? 'Creating link…' : 'Create link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
