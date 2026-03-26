import { Markdown } from '@/components/common/markdown';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type NoteViewDialogProps = {
  content: string;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const NoteViewDialog = ({ content, onEdit, onOpenChange, open }: NoteViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-h-[80vh] w-[calc(100%-4rem)] max-w-5xl max-w-5xl sm:max-w-5xl overflow-auto rounded-sm p-0'
        showCloseButton={false}
      >
        <div aria-label='Preview note' className='p-6' onDoubleClick={onEdit} role='document'>
          <Markdown content={content} emptyMessage='This note is empty.' />
        </div>
      </DialogContent>
    </Dialog>
  );
};
