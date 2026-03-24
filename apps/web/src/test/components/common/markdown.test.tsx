import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from '@/components/common/markdown';

describe('Markdown', () => {
  it('renders markdown content through the shared component', () => {
    render(<Markdown content={'# Daily note\n\n- [x] Done'} />);

    expect(screen.getByRole('heading', { level: 1, name: /daily note/i })).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('renders empty-state copy when content is blank', () => {
    render(<Markdown content='   ' emptyMessage='This note is empty.' />);

    expect(screen.getByText(/this note is empty/i)).toBeInTheDocument();
  });

  it('applies the shared markdown renderer class contract', () => {
    const { container } = render(<Markdown className='custom-markdown' content='Paragraph text' />);

    expect(container.firstElementChild).toHaveClass('markdown-render');
    expect(container.firstElementChild).toHaveClass('custom-markdown');
  });
});
