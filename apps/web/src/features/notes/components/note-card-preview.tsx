import { Markdown } from '@/components/common/markdown';

type NoteCardPreviewProps = {
  content: string;
  onClick: () => void;
  onDoubleClick: () => void;
};

export const NoteCardPreview = ({ content, onClick, onDoubleClick }: NoteCardPreviewProps) => {
  return (
    <div
      aria-label='Open note'
      className='flex max-h-96 cursor-pointer flex-col overflow-auto rounded-sm bg-white p-4 shadow-sm outline-0 transition hover:-translate-y-0.5 hover:shadow-md'
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      role='button'
      tabIndex={0}
    >
      <Markdown content={content} emptyMessage='This note is empty.' />
    </div>
  );
};
