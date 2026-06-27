import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CheckboxContext } from '@/components/common/checkbox-context';
import { Markdown } from '@/components/common/markdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import {
  applyCheckboxToggles,
  collectDescendants,
  parseCheckboxes,
} from '@/features/notes/lib/note-checkboxes';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';

type NoteViewDialogProps = {
  content: string;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  onSave?: (content: string) => void;
  open: boolean;
};

export const NoteViewDialog = ({
  content,
  onEdit,
  onOpenChange,
  onSave,
  open,
}: NoteViewDialogProps) => {
  const screen = useTailwindScreen();
  const isDesktop = screen === 'md' || screen === 'lg' || screen === 'xl' || screen === '2xl';
  const containerRef = useRef<HTMLDivElement>(null);

  const checkboxMeta = useMemo(() => parseCheckboxes(content), [content]);
  const checkboxContextValue = useMemo(() => ({ enabled: !!onSave }), [onSave]);

  useEffect(() => {
    if (!containerRef.current) return;
    const inputs = containerRef.current.querySelectorAll('input[type="checkbox"]');
    inputs.forEach((input, i) => {
      const meta = checkboxMeta[i];
      if (!meta) return;
      input.setAttribute('data-checkbox-index', String(meta.index));
      input.setAttribute('data-parent-index', String(meta.parentIndex));
    });
  }, [content, checkboxMeta]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' || (target as HTMLInputElement).type !== 'checkbox') return;

      e.preventDefault();

      const allInputs = containerRef.current?.querySelectorAll('input[type="checkbox"]');
      if (!allInputs) return;

      const clickedIndex = Array.from(allInputs).indexOf(target as HTMLInputElement);
      if (clickedIndex === -1 || !checkboxMeta[clickedIndex]) return;

      const cb = checkboxMeta[clickedIndex];
      const newState = !cb.checked;
      const toToggle = collectDescendants(clickedIndex, checkboxMeta);
      onSave?.(applyCheckboxToggles(content, toToggle, checkboxMeta, newState));
    },
    [content, checkboxMeta, onSave],
  );

  const preview = (
    <CheckboxContext.Provider value={checkboxContextValue}>
      <div
        ref={containerRef}
        aria-label='Preview note'
        className='p-6 h-full wrap-anywhere'
        onClickCapture={handleContainerClick}
        onDoubleClick={onEdit}
        role='document'
      >
        <Markdown content={content} emptyMessage='This note is empty.' />
      </div>
    </CheckboxContext.Provider>
  );

  if (isDesktop) {
    return (
      <Dialog disablePointerDismissal onOpenChange={onOpenChange} open={open}>
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
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className='mt-0 gap-0 p-0 before:inset-0 before:rounded-t-[calc(var(--radius-4xl)-0.25rem)]'>
        <DrawerTitle className='sr-only'>Preview note</DrawerTitle>
        <DrawerDescription className='sr-only'>Preview the current note content.</DrawerDescription>
        <div className='h-full overflow-auto rounded-t-[calc(var(--radius-4xl)-0.25rem)] bg-background'>
          {preview}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
