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
        className={'max-w-5xl  sm:max-w-5xl rounded-sm bg-white max-h-[90vh] overflow-auto'}
        showCloseButton={false}
      >
        <div aria-label='Preview note' className='' onDoubleClick={onEdit} role='document'>
          <Markdown content={content} emptyMessage='This note is empty.' />
        </div>
      </DialogContent>
    </Dialog>
  );
};
