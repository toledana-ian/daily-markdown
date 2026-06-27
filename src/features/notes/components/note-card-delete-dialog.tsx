import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type NoteCardDeleteDialogProps = {
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const NoteCardDeleteDialog = ({
  onConfirm,
  onOpenChange,
  open,
}: NoteCardDeleteDialogProps) => {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete note</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone and will permanently remove this note.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant='destructive'>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
