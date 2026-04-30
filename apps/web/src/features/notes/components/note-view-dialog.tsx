import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CheckboxContext } from '@/components/common/checkbox-context';
import { Markdown } from '@/components/common/markdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';

type CheckboxInfo = {
  index: number;
  lineIndex: number;
  indentation: number;
  checked: boolean;
  parentIndex: number;
};

function parseCheckboxes(content: string): CheckboxInfo[] {
  const lines = content.split('\n');
  const checkboxes: CheckboxInfo[] = [];
  const checkboxRegex = /^(\s*)- \[([ x])\]/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(checkboxRegex);
    if (!match) continue;

    const indentation = match[1].length;
    const checked = match[2] === 'x';
    const index = checkboxes.length;

    // Nearest preceding checkbox with strictly less indentation is the parent
    let parentIndex = -1;
    for (let j = checkboxes.length - 1; j >= 0; j--) {
      if (checkboxes[j].indentation < indentation) {
        parentIndex = checkboxes[j].index;
        break;
      }
    }

    checkboxes.push({ index, lineIndex: i, indentation, checked, parentIndex });
  }

  return checkboxes;
}

function collectDescendants(targetIndex: number, checkboxes: CheckboxInfo[]): number[] {
  const result: number[] = [targetIndex];
  const queue = [targetIndex];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const cb of checkboxes) {
      if (cb.parentIndex === current) {
        result.push(cb.index);
        queue.push(cb.index);
      }
    }
  }

  return result;
}

function applyCheckboxToggles(
  content: string,
  indicesToToggle: number[],
  checkboxes: CheckboxInfo[],
  newState: boolean,
): string {
  const lines = content.split('\n');
  const indexSet = new Set(indicesToToggle);

  for (const cb of checkboxes) {
    if (!indexSet.has(cb.index)) continue;
    lines[cb.lineIndex] = newState
      ? lines[cb.lineIndex].replace(/- \[ \]/, '- [x]')
      : lines[cb.lineIndex].replace(/- \[x\]/, '- [ ]');
  }

  return lines.join('\n');
}
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
    <div
      aria-label='Preview note'
      className='p-6 h-full wrap-anywhere'
      onDoubleClick={onEdit}
      role='document'
    >
      <Markdown content={content} emptyMessage='This note is empty.' />
    </div>
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
