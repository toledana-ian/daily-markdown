import { Markdown } from '@/components/common/markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type NoteViewDialogProps = {
  content: string;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const NoteViewDialog = ({ content, onEdit, onOpenChange, open }: NoteViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>View note</DialogTitle>
        </DialogHeader>
        <div
          aria-label='Preview note'
          className='max-h-[70vh] overflow-y-auto rounded-sm border border-border bg-white p-5'
          onDoubleClick={onEdit}
          role='document'
        >
          <Markdown content={content} emptyMessage='This note is empty.' />
        </div>
      </DialogContent>
    </Dialog>
  );
};
