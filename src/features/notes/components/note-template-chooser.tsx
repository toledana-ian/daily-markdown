import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';
import { cn } from '@/lib/utils';
import {
  NOTE_TEMPLATES,
  type NoteTemplate,
  type NoteTemplateId,
} from '@/features/notes/lib/note-templates';
import {
  RiCalendarCheckLine,
  RiCalendarLine,
  RiFileLine,
  RiTeamLine,
} from '@remixicon/react';

type NoteTemplateChooserProps = {
  onOpenChange: (open: boolean) => void;
  onSelect: (templateId: NoteTemplateId) => void;
  open: boolean;
};

const TEMPLATE_ICONS: Record<NoteTemplateId, typeof RiFileLine> = {
  blank: RiFileLine,
  'daily-planning': RiCalendarLine,
  'daily-review': RiCalendarCheckLine,
  'meeting-notes': RiTeamLine,
};

const TemplateOptions = ({
  onSelect,
  selectedIndex,
  setSelectedIndex,
}: {
  onSelect: (templateId: NoteTemplateId) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}) => {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    optionRefs.current[selectedIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div
      aria-activedescendant={`note-template-option-${NOTE_TEMPLATES[selectedIndex]!.id}`}
      aria-label='Note templates'
      className='flex flex-col gap-1 p-2'
      role='listbox'
    >
      {NOTE_TEMPLATES.map((template, index) => (
        <TemplateOption
          key={template.id}
          isSelected={index === selectedIndex}
          onMouseEnter={() => setSelectedIndex(index)}
          onSelect={onSelect}
          optionRef={(element) => {
            optionRefs.current[index] = element;
          }}
          template={template}
        />
      ))}
    </div>
  );
};

const TemplateOption = ({
  isSelected,
  onMouseEnter,
  onSelect,
  optionRef,
  template,
}: {
  isSelected: boolean;
  onMouseEnter: () => void;
  onSelect: (templateId: NoteTemplateId) => void;
  optionRef: (element: HTMLButtonElement | null) => void;
  template: NoteTemplate;
}) => {
  const Icon = TEMPLATE_ICONS[template.id];

  return (
    <button
      ref={optionRef}
      aria-selected={isSelected}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
      )}
      id={`note-template-option-${template.id}`}
      onClick={() => onSelect(template.id)}
      onMouseEnter={onMouseEnter}
      role='option'
      type='button'
    >
      <Icon aria-hidden='true' className='mt-0.5 size-5 shrink-0 text-muted-foreground' />
      <span className='min-w-0'>
        <span className='block font-medium text-foreground'>{template.label}</span>
        <span className='mt-0.5 block text-sm text-muted-foreground'>{template.description}</span>
      </span>
    </button>
  );
};

export const NoteTemplateChooser = ({ onOpenChange, onSelect, open }: NoteTemplateChooserProps) => {
  const screen = useTailwindScreen();
  const isDesktop = screen === 'md' || screen === 'lg' || screen === 'xl' || screen === '2xl';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (templateId: NoteTemplateId) => {
      onSelect(templateId);
      onOpenChange(false);
    },
    [onOpenChange, onSelect],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((currentIndex) => (currentIndex + 1) % NOTE_TEMPLATES.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(
          (currentIndex) => (currentIndex - 1 + NOTE_TEMPLATES.length) % NOTE_TEMPLATES.length,
        );
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleSelect(NOTE_TEMPLATES[selectedIndex]!.id);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setSelectedIndex(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setSelectedIndex(NOTE_TEMPLATES.length - 1);
      }
    },
    [handleSelect, selectedIndex],
  );

  useEffect(() => {
    if (!open) {
      setSelectedIndex(0);
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
        onSelect={handleSelect}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-md gap-0 overflow-hidden p-0 sm:max-w-md'>
          <DialogTitle className='px-4 pt-4 text-base font-medium'>New note</DialogTitle>
          <DialogDescription className='sr-only'>
            Select a template to start your note.
          </DialogDescription>
          {chooserBody}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='gap-0 p-0'>
        <DrawerTitle className='px-4 pt-2 text-base font-medium'>New note</DrawerTitle>
        <DrawerDescription className='sr-only'>
          Select a template to start your note.
        </DrawerDescription>
        {chooserBody}
      </DrawerContent>
    </Drawer>
  );
};
