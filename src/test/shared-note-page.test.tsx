import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedNotePage } from '@/features/notes/pages/shared-note-page';

const rpcMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useParams: () => ({ shareId: 'share-token-1' }),
}));

vi.mock('@/lib/supabase/client.ts', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}));

describe('SharedNotePage', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('shows empty state when shared note content is an empty string', async () => {
    rpcMock.mockResolvedValue({ data: [{ content: '' }], error: null });

    render(<SharedNotePage />);

    expect(await screen.findByText('This shared note is empty.')).toBeInTheDocument();
  });
});
