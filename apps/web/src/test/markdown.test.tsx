import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from '@/components/common/markdown';

describe('Markdown', () => {
  it('renders base64 svg data urls for linked file thumbnails', () => {
    render(
      <Markdown
        content='[![PDF file](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)](https://example.com/report.pdf)'
      />,
    );

    const image = screen.getByRole('img', { name: 'PDF file' });
    expect(image).toHaveAttribute('src', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=');
  });
});
