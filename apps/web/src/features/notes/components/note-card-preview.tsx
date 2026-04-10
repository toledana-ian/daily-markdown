import { Markdown } from '@/components/common/markdown';

type NoteCardPreviewProps = {
  content: string;
  onClick: () => void;
};

export const NoteCardPreview = ({ content, onClick }: NoteCardPreviewProps) => {
  return (
    <div
      aria-label='Open note'
      className='flex max-h-96 cursor-pointer flex-col overflow-y-auto wrap-anywhere rounded-sm bg-white p-4 shadow-sm outline-0 transition hover:-translate-y-0.5 hover:shadow-md'
      onClick={onClick}
      role='button'
      tabIndex={0}
    >
      <Markdown content={content} emptyMessage='This note is empty.' />
    </div>
  );
};
