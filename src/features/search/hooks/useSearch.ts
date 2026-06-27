import { useSearchStore } from '@/features/search/store/search.ts';

export const useSearch = () => {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);

  return { query, setQuery };
};
