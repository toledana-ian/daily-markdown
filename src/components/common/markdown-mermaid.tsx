import { mermaid } from '@streamdown/mermaid';
import type { CustomRendererProps } from 'streamdown';
import { useEffect, useState } from 'react';

let renderCount = 0;

type MermaidRenderState = { chart: string; svg: string } | { chart: string; error: string };

export const MarkdownMermaid = ({ code, isIncomplete }: CustomRendererProps) => {
  const [result, setResult] = useState<MermaidRenderState | null>(null);

  useEffect(() => {
    if (isIncomplete || !code.trim()) {
      return;
    }

    let isCancelled = false;
    // Mermaid uses the id for temporary DOM nodes, so concurrent renders need distinct ids.
    renderCount += 1;
    const id = `markdown-mermaid-${renderCount}`;

    mermaid
      .getMermaid()
      .render(id, code)
      .then(({ svg }) => {
        if (!isCancelled) setResult({ chart: code, svg });
      })
      .catch((error: unknown) => {
        if (isCancelled) return;
        const message = error instanceof Error ? error.message : 'Failed to render Mermaid chart';
        setResult({ chart: code, error: message });
      });

    return () => {
      isCancelled = true;
    };
  }, [code, isIncomplete]);

  const current = result?.chart === code ? result : null;

  if (current && 'error' in current) {
    return (
      <div className='my-4 rounded-md bg-red-50 p-4' data-streamdown='mermaid-error'>
        <p className='font-mono text-sm text-red-700'>Mermaid Error: {current.error}</p>
        <details className='mt-2'>
          <summary className='cursor-pointer text-xs text-red-600'>Show Code</summary>
          <pre className='mt-2 overflow-x-auto rounded bg-red-100 p-2 text-xs text-red-800'>
            {code}
          </pre>
        </details>
      </div>
    );
  }

  if (!current) {
    return <div className='my-4 min-h-12' data-streamdown='mermaid-loading' />;
  }

  return (
    <div
      aria-label='Mermaid chart'
      className='my-4 flex justify-center overflow-x-auto'
      data-streamdown='mermaid'
      // SVG comes from Mermaid with the plugin's `securityLevel: 'strict'`, which sanitizes it.
      dangerouslySetInnerHTML={{ __html: current.svg }}
      role='img'
    />
  );
};
