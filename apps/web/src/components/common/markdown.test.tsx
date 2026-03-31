import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from './markdown';

describe('Markdown', () => {
  it('removes the download button for linked images', () => {
    render(
      <Markdown content='[![Linked image](https://example.com/image.png)](https://example.com/file.txt)' />
    );

    const image = screen.getByRole('img', { name: 'Linked image' });
    const link = image.closest('a');

    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', 'https://example.com/file.txt');
    expect(screen.queryByTitle('Download image')).not.toBeInTheDocument();
  });

  it('keeps the download button for standalone images', () => {
    render(<Markdown content='![Standalone image](https://example.com/image.png)' />);

    expect(screen.getByRole('img', { name: 'Standalone image' })).toBeInTheDocument();
    expect(screen.getByTitle('Download image')).toBeInTheDocument();
  });
});
