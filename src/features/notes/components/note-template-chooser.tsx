import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';
import { cn } from '@/lib/utils';
import {
  BLANK_NOTE_TEMPLATE,
  type NoteTemplate,
  type NoteTemplateSelection,
} from '@/features/notes/lib/note-templates';
import { NOTE_TEMPLATE_ICON_COMPONENTS } from '@/features/notes/lib/note-template-icons';
import { NoteTemplateFormDialog } from '@/features/notes/components/note-template-form-dialog';
import { useNoteTemplates } from '@/features/notes/hooks/use-note-templates';
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from '@remixicon/react';

type NoteTemplateChooserProps = {
  onOpenChange: (open: boolean) => void;
  onSelect: (selection: NoteTemplateSelection) => void;
  open: boolean;
};

type ChooserRow =
  | { type: 'blank'; template: NoteTemplate }
  | { type: 'user'; template: NoteTemplate }
  | { type: 'add' };

const getRowId = (row: ChooserRow): string => {
  if (row.type === 'add') {
    return 'add';
  }

  return row.template.id;
};

const TemplateOption = ({
  isSelected,
  onDelete,
  onEdit,
  onMouseEnter,
  onSelect,
  optionRef,
  row,
}: {
  isSelected: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onMouseEnter: () => void;
  onSelect: () => void;
  optionRef: (element: HTMLButtonElement | null) => void;
  row: ChooserRow;
}) => {
  const Icon = row.type === 'add' ? RiAddLine : NOTE_TEMPLATE_ICON_COMPONENTS[row.template.icon];
  const label = row.type === 'add' ? 'Add template' : row.template.name;
  const description =
    row.type === 'add' ? 'Create a reusable starting point.' : row.template.description;
  const showActions = row.type === 'user';

  return (
    <div
      className={cn(
        'group flex w-full items-start gap-1 rounded-lg transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
      )}
      onMouseEnter={onMouseEnter}
    >
      <button
        ref={optionRef}
        aria-selected={isSelected}
        className='flex min-w-0 flex-1 items-start gap-3 px-3 py-3 text-left'
        id={`note-template-option-${getRowId(row)}`}
        onClick={onSelect}
        role='option'
        type='button'
      >
        <Icon aria-hidden='true' className='mt-0.5 size-5 shrink-0 text-muted-foreground' />
        <span className='min-w-0'>
          <span className='block font-medium text-foreground'>{label}</span>
          <span className='mt-0.5 block text-sm text-muted-foreground'>{description}</span>
        </span>
      </button>

      {showActions && (
        <div className='flex shrink-0 items-center gap-0.5 self-center pr-2 opacity-0 transition-opacity group-hover:opacity-100'>
          <button
            aria-label={`Edit ${row.template.name}`}
            className='rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground'
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.();
            }}
            type='button'
          >
            <RiPencilLine className='size-4' />
          </button>
          <button
            aria-label={`Delete ${row.template.name}`}
            className='rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-destructive'
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
            type='button'
          >
            <RiDeleteBinLine className='size-4' />
          </button>
        </div>
      )}
    </div>
  );
};

const TemplateOptions = ({
  isLoading,
  onAdd,
  onDelete,
  onEdit,
  onSelect,
  rows,
  selectedIndex,
  setSelectedIndex,
}: {
  isLoading: boolean;
  onAdd: () => void;
  onDelete: (template: NoteTemplate) => void;
  onEdit: (template: NoteTemplate) => void;
  onSelect: (row: ChooserRow) => void;
  rows: ChooserRow[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}) => {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    optionRefs.current[selectedIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedIndex]);

  if (isLoading) {
    return (
      <p className='flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground'>
        <Spinner />
        Loading templates...
      </p>
    );
  }

  return (
    <div
      aria-activedescendant={`note-template-option-${getRowId(rows[selectedIndex]!)}`}
      aria-label='Note templates'
      className='flex flex-col gap-1 p-2'
      role='listbox'
    >
      {rows.map((row, index) => (
        <TemplateOption
          key={getRowId(row)}
          isSelected={index === selectedIndex}
          onDelete={row.type === 'user' ? () => onDelete(row.template) : undefined}
          onEdit={row.type === 'user' ? () => onEdit(row.template) : undefined}
          onMouseEnter={() => setSelectedIndex(index)}
          onSelect={() => {
            if (row.type === 'add') {
              onAdd();
              return;
            }

            onSelect(row);
          }}
          optionRef={(element) => {
            optionRefs.current[index] = element;
          }}
          row={row}
        />
      ))}
    </div>
  );
};

export const NoteTemplateChooser = ({ onOpenChange, onSelect, open }: NoteTemplateChooserProps) => {
  const screen = useTailwindScreen();
  const isDesktop = screen === 'md' || screen === 'lg' || screen === 'xl' || screen === '2xl';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NoteTemplate | null>(null);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const { templates, isLoading, loadTemplates, createTemplate, updateTemplate, deleteTemplate } =
    useNoteTemplates();

  const rows = useMemo<ChooserRow[]>(
    () => [
      { type: 'blank', template: BLANK_NOTE_TEMPLATE },
      ...templates.map((template) => ({ type: 'user' as const, template })),
      { type: 'add' },
    ],
    [templates],
  );

  const activeIndex = rows.length === 0 ? 0 : Math.min(selectedIndex, rows.length - 1);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSelectedIndex(0);
      }

      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    loadTemplates({ silent: true }).then();
  }, [loadTemplates, open]);

  const handleRowSelect = useCallback(
    (row: ChooserRow) => {
      if (row.type === 'add') {
        setEditingTemplate(null);
        setFormOpen(true);
        return;
      }

      if (row.type === 'blank') {
        onSelect({ kind: 'blank' });
        handleOpenChange(false);
        return;
      }

      onSelect({ kind: 'user', templateId: row.template.id });
      handleOpenChange(false);
    },
    [handleOpenChange, onSelect],
  );

  const handleSelect = useCallback(
    (row: ChooserRow) => {
      handleRowSelect(row);
    },
    [handleRowSelect],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (rows.length === 0) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((currentIndex) => (currentIndex + 1) % rows.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((currentIndex) => (currentIndex - 1 + rows.length) % rows.length);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleRowSelect(rows[activeIndex]!);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setSelectedIndex(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setSelectedIndex(rows.length - 1);
      }
    },
    [activeIndex, handleRowSelect, rows],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    keyboardContainerRef.current?.focus();
  }, [open]);

  const chooserBody = (
    <div onKeyDown={handleKeyDown} ref={keyboardContainerRef} tabIndex={-1}>
      <p className='px-4 pb-1 pt-3 text-sm text-muted-foreground'>
        Choose a starting point for your note.
      </p>
      <TemplateOptions
        isLoading={isLoading}
        onAdd={() => {
          setEditingTemplate(null);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
        onEdit={(template) => {
          setEditingTemplate(template);
          setFormOpen(true);
        }}
        onSelect={handleSelect}
        rows={rows}
        selectedIndex={activeIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );

  return (
    <>
      {isDesktop ? (
        <Dialog onOpenChange={handleOpenChange} open={open}>
          <DialogContent className='max-w-md gap-0 overflow-hidden rounded-sm p-0 sm:max-w-md'>
            <DialogTitle className='px-4 pt-4 text-base font-medium'>New note</DialogTitle>
            <DialogDescription className='sr-only'>
              Select a template to start your note.
            </DialogDescription>
            {chooserBody}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer onOpenChange={handleOpenChange} open={open}>
          <DrawerContent className='gap-0 p-0'>
            <DrawerTitle className='px-4 pt-2 text-base font-medium'>New note</DrawerTitle>
            <DrawerDescription className='sr-only'>
              Select a template to start your note.
            </DrawerDescription>
            {chooserBody}
          </DrawerContent>
        </Drawer>
      )}

      <NoteTemplateFormDialog
        initialTemplate={editingTemplate}
        onOpenChange={setFormOpen}
        onSave={async (input) => {
          if (editingTemplate) {
            await updateTemplate(editingTemplate.id, input);
            return;
          }

          await createTemplate(input);
        }}
        open={formOpen}
      />

      <AlertDialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteTemplate(deleteTarget.id).then();
                }
                setDeleteTarget(null);
              }}
              variant='destructive'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
