import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Markdown } from '@/components/common/markdown';

const { renderMock } = vi.hoisted(() => ({
  renderMock: vi.fn(async (_id: string, source: string) => ({
    svg: `<svg data-testid="mermaid-svg"><text>${source.length}</text></svg>`,
  })),
}));

vi.mock('@streamdown/mermaid', () => ({
  mermaid: {
    name: 'mermaid',
    type: 'diagram',
    language: 'mermaid',
    getMermaid: () => ({ initialize: vi.fn(), render: renderMock }),
  },
}));

const diagram = 'graph TD\n  A --> B';

describe('Markdown mermaid diagrams', () => {
  beforeEach(() => {
    renderMock.mockClear();
  });

  it('renders the diagram inline without viewer chrome or controls', async () => {
    const { container } = render(
      <Markdown content={`Before\n\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\nAfter`} />,
    );

    expect(await screen.findByTestId('mermaid-svg')).toBeInTheDocument();
    expect(renderMock).toHaveBeenCalledWith(expect.any(String), `${diagram}\n`);
    expect(screen.getByRole('img', { name: 'Mermaid chart' })).toContainElement(
      screen.getByTestId('mermaid-svg'),
    );

    expect(container.querySelector('[data-streamdown="mermaid-block"]')).toBeNull();
    expect(container.querySelector('[data-streamdown="mermaid-block-actions"]')).toBeNull();
    expect(container.querySelector('[role="application"]')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(screen.queryByText('mermaid')).toBeNull();
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('shows the source when the diagram fails to render', async () => {
    renderMock.mockRejectedValueOnce(new Error('Parse error'));

    render(<Markdown content={`\`\`\`mermaid\n${diagram}\n\`\`\``} />);

    expect(await screen.findByText('Mermaid Error: Parse error')).toBeInTheDocument();
    expect(screen.queryByTestId('mermaid-svg')).toBeNull();
  });

  it('keeps regular code blocks on the default renderer', async () => {
    const { container } = render(<Markdown content={'```js\nconst a = 1;\n```'} />);

    expect(await screen.findByText(/const a = 1;/)).toBeInTheDocument();
    expect(container.querySelector('[data-streamdown="code-block"]')).not.toBeNull();
    expect(renderMock).not.toHaveBeenCalled();
  });
});
