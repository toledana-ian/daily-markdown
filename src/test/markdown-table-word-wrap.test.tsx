import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { Markdown } from '@/components/common/markdown';

describe('Markdown table word wrap', () => {
  beforeAll(() => {
    // Mirror the production rule from index.css. Full Tailwind CSS cannot be
    // loaded in jsdom without blowing the stack on @import chains.
    const style = document.createElement('style');
    style.textContent = `
      .wrap-anywhere { overflow-wrap: anywhere; }
      .markdownnote-editor-container th,
      .markdownnote-editor-container td {
        overflow-wrap: normal;
        word-break: normal;
      }
    `;
    document.head.appendChild(style);
  });

  it('overrides wrap-anywhere on table cells so words stay intact', () => {
    const { container } = render(
      <div className='wrap-anywhere'>
        <Markdown content={['| Task |', '| --- |', '| Backup database |'].join('\n')} />
      </div>,
    );

    const cell = container.querySelector('td');
    expect(cell).not.toBeNull();

    const styles = getComputedStyle(cell!);
    expect(styles.overflowWrap).toBe('normal');
    expect(styles.wordBreak).toBe('normal');
  });
});
