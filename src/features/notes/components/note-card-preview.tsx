import { Markdown } from '@/components/common/markdown';
import { useCallback, useEffect, useRef, useState } from 'react';

type NoteCardPreviewProps = {
  content: string;
  onClick: () => void;
};

export const NoteCardPreview = ({ content, onClick }: NoteCardPreviewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const updateThumb = useCallback(() => {
    const container = containerRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);

    const trackHeight =
      indicatorRef.current?.clientHeight ||
      Math.max(0, (containerRef.current?.clientHeight ?? 0) - 16);
    if (trackHeight === 0) return;
    const minThumbHeight = 28;
    const desiredThumbHeight =
      maxScrollTop === 0 ? trackHeight : (clientHeight / scrollHeight) * trackHeight;
    const thumbHeight = Math.min(trackHeight, Math.max(minThumbHeight, desiredThumbHeight));
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = maxScrollTop === 0 ? 0 : (scrollTop / maxScrollTop) * maxThumbTop;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  }, []);

  const scheduleThumbUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      updateThumb();
    });
  }, [updateThumb]);

  const onScroll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      setIsScrollable(container.scrollHeight > container.clientHeight + 1);
    }
    scheduleThumbUpdate();
    setIsScrolling(true);

    if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setIsScrolling(false), 700);
  }, [scheduleThumbUpdate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      const nextScrollable = container.scrollHeight > container.clientHeight + 1;
      setIsScrollable(nextScrollable);
      scheduleThumbUpdate();
    });
    resizeObserver.observe(container);

    const nextScrollable = container.scrollHeight > container.clientHeight + 1;
    setIsScrollable(nextScrollable);
    scheduleThumbUpdate();

    return () => resizeObserver.disconnect();
  }, [scheduleThumbUpdate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nextScrollable = container.scrollHeight > container.clientHeight + 1;
    setIsScrollable(nextScrollable);
    scheduleThumbUpdate();
  }, [content, scheduleThumbUpdate]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <div
      aria-label='Open note'
      className='note-card-preview group relative flex h-96 cursor-pointer flex-col overflow-hidden rounded-sm bg-white shadow-sm outline-0 transition hover:-translate-y-0.5 hover:shadow-md'
      onClick={onClick}
      role='button'
      tabIndex={0}
    >
      <div
        className='note-card-preview-scroll relative flex-1 overflow-auto wrap-anywhere p-4'
        onScroll={onScroll}
        ref={containerRef}
      >
        <div className='pointer-events-none'>
          <Markdown content={content} emptyMessage='This note is empty.' />
        </div>
        <div
          aria-hidden='true'
          className='note-card-preview-interaction-shield absolute inset-0 z-[1] cursor-pointer touch-pan-y'
        />
      </div>

      <div
        className='note-card-preview-scroll-indicator'
        aria-hidden='true'
        ref={indicatorRef}
        style={{ opacity: isScrollable && isScrolling ? 1 : 0 }}
      >
        <div ref={thumbRef} className='note-card-preview-scroll-thumb' />
      </div>
    </div>
  );
};
