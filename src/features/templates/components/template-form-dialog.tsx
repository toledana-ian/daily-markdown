import { useCallback, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';
import { cn } from '@/lib/utils';
import {
  DEFAULT_TEMPLATE_ICON,
  TEMPLATE_ICON_KEYS,
  type Template,
  type TemplateInput,
} from '@/features/templates/lib/templates';
import { TEMPLATE_ICON_COMPONENTS } from '@/features/templates/lib/template-icons';

type TemplateFormDialogProps = {
  initialTemplate?: Template | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: TemplateInput) => void | Promise<void>;
  open: boolean;
};

const emptyFormState = (): TemplateInput => ({
  name: '',
  description: '',
  icon: DEFAULT_TEMPLATE_ICON,
  content: '',
});

export const TemplateFormDialog = ({
  initialTemplate,
  onOpenChange,
  onSave,
  open,
}: TemplateFormDialogProps) => {
  const screen = useTailwindScreen();
  const isDesktop = screen === 'md' || screen === 'lg' || screen === 'xl' || screen === '2xl';
  const [formState, setFormState] = useState<TemplateInput>(emptyFormState);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(initialTemplate);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialTemplate) {
      setFormState({
        name: initialTemplate.name,
        description: initialTemplate.description,
        icon: initialTemplate.icon,
        content: initialTemplate.content,
      });
      return;
    }

    setFormState(emptyFormState());
  }, [initialTemplate, open]);

  const handleSave = useCallback(async () => {
    const trimmedName = formState.name.trim();
    const trimmedDescription = formState.description.trim();

    if (!trimmedName || !trimmedDescription) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        name: trimmedName,
        description: trimmedDescription,
        icon: formState.icon,
        content: formState.content,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }, [formState, onOpenChange, onSave]);

  const canSave = formState.name.trim().length > 0 && formState.description.trim().length > 0;

  const formBody = (
    <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'>
      <div className='space-y-4 px-4'>
        <div className='space-y-1.5'>
          <label className='text-sm font-medium text-foreground' htmlFor='template-name'>
            Name
          </label>
          <Input
            autoFocus
            id='template-name'
            onChange={(event) => {
              setFormState((current) => ({ ...current, name: event.target.value }));
            }}
            placeholder='Template name'
            value={formState.name}
          />
        </div>

        <div className='space-y-1.5'>
          <label
            className='text-sm font-medium text-foreground'
            htmlFor='template-description'
          >
            Description
          </label>
          <Input
            id='template-description'
            onChange={(event) => {
              setFormState((current) => ({ ...current, description: event.target.value }));
            }}
            placeholder='Short description'
            value={formState.description}
          />
        </div>

        <div className='space-y-1.5'>
          <span className='text-sm font-medium text-foreground'>Icon</span>
          <div className='flex flex-wrap gap-2'>
            {TEMPLATE_ICON_KEYS.map((iconKey) => {
              const Icon = TEMPLATE_ICON_COMPONENTS[iconKey];
              const isSelected = formState.icon === iconKey;

              return (
                <button
                  key={iconKey}
                  aria-label={`${iconKey} icon`}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg border transition-colors',
                    isSelected
                      ? 'border-foreground bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent/60',
                  )}
                  onClick={() => {
                    setFormState((current) => ({ ...current, icon: iconKey }));
                  }}
                  type='button'
                >
                  <Icon aria-hidden='true' className='size-5' />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-hidden border-t'>
        <CodeMirror
          aria-label='Template markdown content'
          className='h-full max-w-full min-h-48 p-0 [&_.cm-editor]:max-w-full [&_.cm-scroller]:overflow-x-hidden [&_.cm-content]:whitespace-pre-wrap [&_.cm-line]:wrap-break-word'
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            EditorView.lineWrapping,
          ]}
          height='100%'
          onChange={(value) => {
            setFormState((current) => ({ ...current, content: value }));
          }}
          placeholder='Write template markdown...'
          theme={vscodeLight}
          value={formState.content}
        />
      </div>
    </div>
  );

  const footer = (
    <>
      <Button
        onClick={() => {
          onOpenChange(false);
        }}
        type='button'
        variant='outline'
      >
        Cancel
      </Button>
      <Button disabled={!canSave || isSaving} onClick={handleSave} type='button'>
        {isEditing ? 'Save changes' : 'Create template'}
      </Button>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent
          className='flex h-[80vh] max-h-[80vh] w-[calc(100%-4rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-sm p-0 sm:max-w-3xl'
          showCloseButton={false}
        >
          <DialogTitle className='px-4 pt-4 text-base font-medium'>
            {isEditing ? 'Edit template' : 'New template'}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            {isEditing ? 'Edit your note template.' : 'Create a new note template.'}
          </DialogDescription>
          {formBody}
          <DialogFooter className='border-t px-4 py-3'>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className='flex max-h-[90vh] flex-col gap-0 p-0'>
        <DrawerTitle className='px-4 pt-2 text-base font-medium'>
          {isEditing ? 'Edit template' : 'New template'}
        </DrawerTitle>
        <DrawerDescription className='sr-only'>
          {isEditing ? 'Edit your note template.' : 'Create a new note template.'}
        </DrawerDescription>
        {formBody}
        <DrawerFooter className='border-t'>{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
