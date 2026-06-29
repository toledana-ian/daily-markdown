import { render, screen } from '@testing-library/react';
import type { JSX } from 'react';
import { MarkdownListItem } from '@/components/common/markdown-list-item';

type FakeParagraphProps = JSX.IntrinsicElements['p'] & { node?: unknown };
const FakeParagraph = (props: FakeParagraphProps) => <p {...props} />;

describe('MarkdownListItem', () => {
  it('does not render blank newline text nodes before a link-only item', () => {
    const fakePNode = { tagName: 'p', children: [] } as unknown;

    render(
      <ul>
        <MarkdownListItem>
          {[
            '\n',
            <FakeParagraph key='p' node={fakePNode}>
              {'\n'}
              <a href='https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver'>
                ResizeObserver MDN
              </a>
              {'\n'}
            </FakeParagraph>,
            '\n',
          ]}
        </MarkdownListItem>
      </ul>,
    );

    const li = screen.getByRole('listitem');
    const link = screen.getByRole('link', { name: /resizeobserver mdn/i });

    expect(link.parentElement).toBe(li);

    const hasBlankNewlineTextNode = Array.from(li.childNodes).some((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return false;
      const text = node.textContent ?? '';
      return text.includes('\n') && text.trim() === '';
    });

    expect(hasBlankNewlineTextNode).toBe(false);
  });
});
