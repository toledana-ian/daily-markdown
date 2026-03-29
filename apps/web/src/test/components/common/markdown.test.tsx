import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Markdown, isImageParagraph } from '@/components/common/markdown';

describe('Markdown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    expect(container.firstElementChild).toHaveClass('markdown-container');
    expect(container.firstElementChild).toHaveClass('custom-markdown');
  });

  it('does not emit paragraph nesting warnings for inline images', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Markdown content={'Paragraph before ![image](https://placehold.co/320x180/png) paragraph after'} />,
    );

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('<div> cannot be a descendant of <p>'),
    );
  });

  it('detects paragraph nodes that contain markdown images', () => {
    expect(
      isImageParagraph({
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [
          { type: 'text', value: 'before ' },
          {
            type: 'element',
            tagName: 'img',
            properties: { alt: 'image', src: 'https://placehold.co/320x180/png' },
            children: [],
          },
          { type: 'text', value: ' after' },
        ],
      } as never),
    ).toBe(true);
  });
});
