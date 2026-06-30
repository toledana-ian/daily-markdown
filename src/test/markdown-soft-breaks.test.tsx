import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from '@/components/common/markdown';

describe('Markdown soft line breaks', () => {
  it('preserves single newlines in text paragraphs visually', () => {
    const { container } = render(
      <Markdown
        content={[
          'feat-subscription-status-dashboard',
          'fix-school-media-image-upload',
          '',
          'fix-student-resource-admin-login',
        ].join('\n')}
      />,
    );

    const firstParagraph = screen.getByText(/feat-subscription-status-dashboard/);

    expect(firstParagraph.querySelector('br')).toBeInTheDocument();
    expect(firstParagraph).toHaveTextContent('feat-subscription-status-dashboard');
    expect(firstParagraph).toHaveTextContent('fix-school-media-image-upload');
    expect(container.querySelectorAll('p')).toHaveLength(2);
    expect(screen.getByText('fix-student-resource-admin-login')).toBeInTheDocument();
  });
});
