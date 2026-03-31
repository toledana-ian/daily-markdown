import { RiDownloadLine } from '@remixicon/react';
import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import type { Element } from 'hast';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'katex/dist/katex.min.css';
import 'rehype-github-alerts/styling/css/index.css';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import 'streamdown/styles.css';
import { Streamdown, type StreamdownProps } from 'streamdown';
import { cn } from '@/lib/utils';

const markdownPlugins: NonNullable<StreamdownProps['plugins']> = {
  cjk,
  code,
  math,
  mermaid,
};

const markdownRehypePlugins: NonNullable<StreamdownProps['rehypePlugins']> = [
  [rehypeGithubAlerts, {}],
];

const hasImageDescendant = (node: Element): boolean => {
  return node.children.some((child) => {
    if (child.type !== 'element') {
      return false;
    }

    return child.tagName === 'img' || hasImageDescendant(child);
  });
};

const isImageParagraph = (node?: Element) => {
  return node?.tagName === 'p' && hasImageDescendant(node);
};

const downloadFile = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const IMAGE_EXTENSION_PATTERN = /\.[^/.]+$/;

const MarkdownImage = ({
  alt,
  className,
  node,
  onError,
  onLoad,
  src,
  ...props
}: JSX.IntrinsicElements['img'] & { node?: Element }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMissing, setIsMissing] = useState(false);
  const [isInsideLink, setIsInsideLink] = useState(false);
  const hasDimensions = props.width != null || props.height != null;
  const showDownloadButton = !isMissing && !isInsideLink;
  const showFallback = isMissing && !hasDimensions;

  useEffect(() => {
    const image = imageRef.current;
    if (!image) {
      return;
    }

    setIsInsideLink(image.closest('a') !== null);

    if (!image.complete) {
      return;
    }

    const loaded = image.naturalWidth > 0;
    setIsLoaded(loaded);
    setIsMissing(!loaded);
  }, []);

  const handleLoad = useCallback<NonNullable<JSX.IntrinsicElements['img']['onLoad']>>(
    (event) => {
      setIsLoaded(true);
      setIsMissing(false);
      onLoad?.(event);
    },
    [onLoad]
  );

  const handleError = useCallback<NonNullable<JSX.IntrinsicElements['img']['onError']>>(
    (event) => {
      setIsLoaded(false);
      setIsMissing(true);
      onError?.(event);
    },
    [onError]
  );

  const handleDownload = useCallback(async () => {
    if (!src) {
      return;
    }

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const pathname = new URL(src, window.location.origin).pathname;
      const originalName = pathname.split('/').pop() || '';
      const extension = blob.type.includes('jpeg')
        ? 'jpg'
        : blob.type.includes('png')
          ? 'png'
          : blob.type.includes('svg')
            ? 'svg'
            : blob.type.includes('gif')
              ? 'gif'
              : blob.type.includes('webp')
                ? 'webp'
                : 'png';
      const filename =
        originalName.includes('.') && originalName.split('.').at(-1)?.length! <= 4
          ? originalName
          : `${(alt || originalName || 'image').replace(IMAGE_EXTENSION_PATTERN, '')}.${extension}`;

      downloadFile(filename, blob);
    } catch {
      window.open(src, '_blank', 'noreferrer');
    }
  }, [alt, src]);

  if (!src) {
    return null;
  }

  return (
    <div className={cn('group relative my-4 inline-block')} data-streamdown='image-wrapper'>
      <img
        alt={alt}
        className={cn('max-w-full rounded-lg', showFallback && 'hidden', className)}
        data-streamdown='image'
        onError={handleError}
        onLoad={handleLoad}
        ref={imageRef}
        src={src}
        {...props}
      />
      {showFallback ? (
        <span className='text-xs text-muted-foreground italic' data-streamdown='image-fallback'>
          Image not available
        </span>
      ) : null}
      <div className='pointer-events-none absolute inset-0 hidden rounded-lg bg-black/10 group-hover:block' />
      {showDownloadButton ? (
        <button
          className='absolute right-2 bottom-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background/90 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-background group-hover:opacity-100'
          onClick={handleDownload}
          title='Download image'
          type='button'
        >
          <RiDownloadLine size={16} />
        </button>
      ) : null}
    </div>
  );
};

export const markdownComponents: StreamdownProps['components'] = {
  img: MarkdownImage,
  p: ({ children, node, ...props }) => {
    if (isImageParagraph(node)) {
      return <div {...props}>{children}</div>;
    }

    return <p {...props}>{children}</p>;
  },
};

type MarkdownProps = {
  className?: string;
  content: string;
  emptyMessage?: string;
};

export const Markdown = ({ className, content, emptyMessage }: MarkdownProps) => {
  if (!content.trim()) {
    return emptyMessage ? (
      <p className={cn('text-sm text-muted-foreground', className)}>{emptyMessage}</p>
    ) : null;
  }

  return (
    <Streamdown
      className={cn('markdown-container', className)}
      components={markdownComponents}
      mode='static'
      plugins={markdownPlugins}
      rehypePlugins={markdownRehypePlugins}
      linkSafety={{ enabled: false }}
    >
      {content}
    </Streamdown>
  );
};
