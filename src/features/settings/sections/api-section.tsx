import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { RiClipboardLine, RiDeleteBinLine, RiPencilLine, RiAddLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { useApiKeys, type ApiKey } from '@/features/api-keys/hooks/use-api-keys.ts';

const defaultExpirationDate = (): string => {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() + 3);
  return date.toISOString().slice(0, 10);
};

const toDateInputValue = (isoDate: string): string => isoDate.slice(0, 10);

const toExpirationIso = (dateValue: string): string => {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!, 23, 59, 59, 999)).toISOString();
};

const isExpired = (expiresAt: string): boolean => new Date(expiresAt).getTime() < Date.now();

type ApiKeyFormProps = {
  name: string;
  expiresAt: string;
  onNameChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
};

const ApiKeyForm = ({ name, expiresAt, onNameChange, onExpiresAtChange }: ApiKeyFormProps) => (
  <div className='space-y-4'>
    <div className='space-y-2'>
      <label htmlFor='api-key-name' className='text-sm font-medium'>
        Name
      </label>
      <Input
        id='api-key-name'
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder='My integration'
        required
      />
    </div>
    <div className='space-y-2'>
      <label htmlFor='api-key-expires' className='text-sm font-medium'>
        Expiration date
      </label>
      <Input
        id='api-key-expires'
        type='date'
        value={expiresAt}
        min={new Date().toISOString().slice(0, 10)}
        onChange={(event) => onExpiresAtChange(event.target.value)}
        required
      />
    </div>
  </div>
);

export const ApiSection = () => {
  const { apiKeys, isLoading, error, createApiKey, updateApiKey, deleteApiKey } = useApiKeys();

  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<ApiKey | null>(null);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);

  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpirationDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setExpiresAt(defaultExpirationDate());
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);
    const result = await createApiKey({
      name,
      expiresAt: toExpirationIso(expiresAt),
    });
    setIsSubmitting(false);

    if (!result) {
      toast.error('Failed to create API key');
      return;
    }

    setCreateOpen(false);
    resetForm();
    setCreatedKey(result.rawKey);
    toast.success('API key created');
  };

  const handleUpdate = async () => {
    if (!editKey || !name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);
    const success = await updateApiKey(editKey.id, {
      name,
      expiresAt: toExpirationIso(expiresAt),
    });
    setIsSubmitting(false);

    if (!success) {
      toast.error('Failed to update API key');
      return;
    }

    setEditKey(null);
    resetForm();
    toast.success('API key updated');
  };

  const handleDelete = async () => {
    if (!deleteKey) return;

    const success = await deleteApiKey(deleteKey.id);
    if (!success) {
      toast.error('Failed to delete API key');
      return;
    }

    setDeleteKey(null);
    toast.success('API key deleted');
  };

  const openEditDialog = (apiKey: ApiKey) => {
    setEditKey(apiKey);
    setName(apiKey.name);
    setExpiresAt(toDateInputValue(apiKey.expiresAt));
  };

  const copyCreatedKey = async () => {
    if (!createdKey) return;

    try {
      await navigator.clipboard.writeText(createdKey);
      toast.success('API key copied');
    } catch {
      toast.error('Failed to copy API key');
    }
  };

  return (
    <section className='space-y-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold'>API</h2>
          <p className='text-sm text-muted-foreground'>
            Create API keys to read your notes programmatically. Keys are shown only once at creation.
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
        >
          <RiAddLine className='size-4' />
          New key
        </Button>
      </div>

      {error && <p className='text-sm text-destructive'>{error}</p>}

      {isLoading ? (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Spinner className='size-4' />
          Loading API keys...
        </div>
      ) : apiKeys.length === 0 ? (
        <p className='text-sm text-muted-foreground'>No API keys yet.</p>
      ) : (
        <ul className='divide-y divide-border rounded-2xl border border-border'>
          {apiKeys.map((apiKey) => (
            <li key={apiKey.id} className='flex items-center justify-between gap-4 p-4'>
              <div className='min-w-0'>
                <p className='font-medium'>{apiKey.name}</p>
                <p className='font-mono text-xs text-muted-foreground'>{apiKey.keyPrefix}...</p>
                <p className='text-xs text-muted-foreground'>
                  Expires {format(parseISO(apiKey.expiresAt), 'MMM d, yyyy')}
                  {isExpired(apiKey.expiresAt) ? ' (expired)' : ''}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Button type='button' variant='ghost' size='icon-sm' onClick={() => openEditDialog(apiKey)}>
                  <RiPencilLine className='size-4' />
                  <span className='sr-only'>Edit</span>
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => setDeleteKey(apiKey)}
                >
                  <RiDeleteBinLine className='size-4' />
                  <span className='sr-only'>Delete</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Give the key a name and choose when it should expire.
            </DialogDescription>
          </DialogHeader>
          <ApiKeyForm
            name={name}
            expiresAt={expiresAt}
            onNameChange={setName}
            onExpiresAtChange={setExpiresAt}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type='button' onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editKey} onOpenChange={(open) => !open && setEditKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API key</DialogTitle>
            <DialogDescription>Update the key name or expiration date.</DialogDescription>
          </DialogHeader>
          <ApiKeyForm
            name={name}
            expiresAt={expiresAt}
            onNameChange={setName}
            onExpiresAtChange={setExpiresAt}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setEditKey(null)}>
              Cancel
            </Button>
            <Button type='button' onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createdKey} onOpenChange={(open) => !open && setCreatedKey(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Copy your API key</DialogTitle>
            <DialogDescription>
              This is the only time the full key will be shown. Store it securely — it cannot be
              recovered later.
            </DialogDescription>
          </DialogHeader>
          <div className='flex items-center gap-2 rounded-2xl border border-border bg-muted/40 p-3'>
            <code className='flex-1 overflow-x-auto font-mono text-xs'>{createdKey}</code>
            <Button type='button' variant='outline' size='icon-sm' onClick={copyCreatedKey}>
              <RiClipboardLine className='size-4' />
              <span className='sr-only'>Copy</span>
            </Button>
          </div>
          <DialogFooter>
            <Button type='button' onClick={() => setCreatedKey(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteKey} onOpenChange={(open) => !open && setDeleteKey(null)}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API key</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteKey
                ? `Delete "${deleteKey.name}"? Any integrations using this key will stop working.`
                : 'Delete this API key?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant='destructive'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
