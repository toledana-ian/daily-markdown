import { HomePage } from '@/pages/HomePage.tsx';
import { ThemeProvider } from '@/context/ThemeContext.tsx';

export const App = () => {
  return (
    <>
      <ThemeProvider defaultTheme={'dark'} storageKey="vite-ui-theme">
        <HomePage />
      </ThemeProvider>
    </>
  );
};
