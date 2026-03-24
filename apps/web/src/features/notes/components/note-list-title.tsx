import { format, isSameDay } from 'date-fns';

interface NoteListTitleProps {
  date: Date;
  searchValue: string;
}

export const NoteListTitle = ({ date, searchValue }: NoteListTitleProps) => {
  const normalizedSearchValue = searchValue.trim();
  const hasSearch = normalizedSearchValue.length > 0;
  const today = new Date();
  const isToday = isSameDay(date, today);

  let primaryText;
  let secondaryText = '';

  if (hasSearch) {
    primaryText = 'Search';
    secondaryText = `${format(date, 'MMMM d, yyyy')}: “${normalizedSearchValue}”`;
  } else if (isToday) {
    primaryText = 'Today';
    secondaryText = format(date, 'EEEE, MMMM d');
  } else {
    primaryText = format(date, 'MMMM d, yyyy');
    secondaryText = format(date, 'EEEE');
  }

  return (
    <>
      <div className={'flex flex-col -mb-4 justify-center items-center'}>
        <div className={'text-xs font-extrabold text-primary uppercase'}>{primaryText}</div>
        <div className={'text-2xl font-extrabold'}>{secondaryText}</div>
      </div>
    </>
  );
};
