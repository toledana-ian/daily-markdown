import { Markdown } from '@/components/common/markdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';

type NoteViewDialogProps = {
  content: string;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const NoteViewDialog = ({ content, onEdit, onOpenChange, open }: NoteViewDialogProps) => {
  const screen = useTailwindScreen();
  const isDesktop = screen === 'md' || screen === 'lg' || screen === 'xl' || screen === '2xl';

  const preview = (
    <div aria-label='Preview note' className='p-6' onDoubleClick={onEdit} role='document'>
      <Markdown content={content} emptyMessage='This note is empty.' />
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className='max-h-[80vh] w-[calc(100%-4rem)] max-w-5xl overflow-auto rounded-sm p-0 sm:max-w-5xl'
          showCloseButton={false}
        >
          <DialogTitle className='sr-only'>Preview note</DialogTitle>
          <DialogDescription className='sr-only'>
            Preview the current note content.
          </DialogDescription>
          {preview}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='max-h-[80vh] gap-0 p-0 before:inset-0 before:rounded-t-[calc(theme(borderRadius.4xl)-0.25rem)]'>
        <DrawerTitle className='sr-only'>Preview note</DrawerTitle>
        <DrawerDescription className='sr-only'>Preview the current note content.</DrawerDescription>
        <div className='overflow-auto rounded-t-[calc(theme(borderRadius.4xl)-0.25rem)] bg-background'>
          {preview}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
