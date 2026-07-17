import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckboxContext } from '@/components/common/checkbox-context';
import { Markdown } from '@/components/common/markdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import {
  findContentEditableTableSpans,
  replaceContentEditableTableAtIndex,
  serializeContentEditableTable,
} from '@/features/notes/lib/note-view-dialog-tables';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previewContainer, setPreviewContainer] = useState<HTMLDivElement | null>(null);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setPreviewContainer(node);
  }, []);

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

  useEffect(() => {
    if (!onSave || !open || !previewContainer) return;

    const container = previewContainer;

    // The `contenteditable` attribute is deferred to `data-content-editable` by
    // markdown.tsx to avoid React's contentEditable/children warning; apply it
    // to the real DOM here so the browser makes these tables editable.
    const editableTables = container.querySelectorAll('table[data-content-editable="true"]');
    editableTables.forEach((table) => table.setAttribute('contenteditable', 'true'));

    const dirtyTables = new WeakSet<HTMLTableElement>();

    const handleInput = (event: Event) => {
      const table = (event.target as HTMLElement).closest('table[contenteditable="true"]');
      if (!table || !container.contains(table)) return;
      dirtyTables.add(table as HTMLTableElement);
    };

    const handleFocusOut = (event: FocusEvent) => {
      const table = (event.target as HTMLElement).closest('table[contenteditable="true"]');
      if (!table || !container.contains(table)) return;

      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && table.contains(relatedTarget)) return;
      if (!dirtyTables.has(table as HTMLTableElement)) return;

      dirtyTables.delete(table as HTMLTableElement);
      const tables = container.querySelectorAll('table[contenteditable="true"]');
      const index = Array.from(tables).indexOf(table);
      if (index === -1) return;

      const originalTableHtml = findContentEditableTableSpans(content)[index]?.html;
      if (!originalTableHtml) return;

      const serialized = serializeContentEditableTable(table as HTMLTableElement, originalTableHtml);
      const updated = replaceContentEditableTableAtIndex(content, index, serialized);
      if (updated !== content) {
        onSave(updated);
      }
    };

    container.addEventListener('input', handleInput);
    container.addEventListener('focusout', handleFocusOut);

    return () => {
      container.removeEventListener('input', handleInput);
      container.removeEventListener('focusout', handleFocusOut);
    };
  }, [content, onSave, open, previewContainer]);

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
        ref={setContainerRef}
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
