interface TagProps {
  textContent: string;
  onClick?: () => void;
}

export const Tag = (props: TagProps) => {
  const { textContent, onClick } = props;
  return (
    <>
      <div
        className={'flex gap-1 hover:bg-gray-100 hover:rounded-sm cursor-pointer'}
        onClick={onClick}
      >
        <span className={'text-primary font-bold'}>#</span>
        <span className={'text-gray-500'}>{textContent}</span>
      </div>
    </>
  );
};
