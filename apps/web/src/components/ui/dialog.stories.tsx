import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave this draft?</DialogTitle>
          <DialogDescription>
            Unsaved changes will be lost if you close this editor now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button>Save draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseIcon: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant='outline'>Review shortcuts</Button>} />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Use <kbd className='rounded bg-muted px-1 py-0.5 text-xs'>Cmd</kbd> +{' '}
            <kbd className='rounded bg-muted px-1 py-0.5 text-xs'>K</kbd> to open search.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button variant='secondary'>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
