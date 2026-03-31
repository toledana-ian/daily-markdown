import { render, screen } from '@testing-library/react';
import { markdownComponents } from '@/components/common/markdown-renderers';
import { Markdown } from '@/components/common/markdown';

describe('markdownComponents', () => {
  test('registers an explicit img renderer', () => {
    expect(markdownComponents?.img).toEqual(expect.any(Function));
  });

  test('renders markdown images with streamdown wrapper markup', () => {
    render(<Markdown content='![Example image](https://example.com/example.png)' />);

    const image = screen.getByRole('img', { name: 'Example image' });

    expect(image).toHaveAttribute(
      'src',
      'https://example.com/example.png'
    );
    expect(image).toHaveAttribute('data-streamdown', 'image');
    expect(image).toHaveClass('max-w-full', 'rounded-lg');
    expect(image).not.toHaveAttribute('node');

    const wrapper = image.closest('[data-streamdown="image-wrapper"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('group', 'relative', 'my-4', 'inline-block');

    expect(screen.getByRole('button', { name: 'Download image' })).toBeInTheDocument();
  });

  test('does not render the download button when the image is inside a link', () => {
    render(
      <Markdown content='[![Linked image](https://example.com/example.png)](https://example.com)' />
    );

    expect(screen.getByRole('img', { name: 'Linked image' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download image' })).not.toBeInTheDocument();
  });
});
