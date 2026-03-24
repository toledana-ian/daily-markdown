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

  const primaryText = hasSearch ? 'Search' : isToday ? 'Today' : format(date, 'MMMM d, yyyy');

  const secondaryText = hasSearch
    ? isToday
      ? `“${normalizedSearchValue}”`
      : `${format(date, 'MMMM d, yyyy')}: “${normalizedSearchValue}”`
    : isToday
      ? format(date, 'EEEE, MMMM d')
      : format(date, 'EEEE');

  return (
    <>
      <div className={'flex flex-col -mb-4 justify-center items-center'}>
        <div className={'text-xs font-extrabold text-primary uppercase'}>{primaryText}</div>
        <div className={'text-2xl font-extrabold'}>{secondaryText}</div>
      </div>
    </>
  );
};
