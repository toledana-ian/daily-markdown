import { Tag } from '@/features/tags/components/tag.tsx';

interface TaglistProps {
  tags: string[];
  onClick?: (tag:string) => void;
}

export const TagListSection = (props:TaglistProps) => {
  const { tags, onClick } = props;

  return (
    <>
      <section className='space-y-1 mt-8'>
        <h2 className='px-1 text-xs font-semibold text-muted-foreground'>HASHTAGS</h2>
        <div className=''>
          {tags.map((tag) => (
            <Tag key={tag} textContent={tag} onClick={()=>{onClick?.(tag)}} />
          ))}
        </div>
      </section>
    </>
  );
}