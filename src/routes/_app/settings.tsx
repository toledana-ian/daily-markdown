import { createFileRoute } from '@tanstack/react-router';
import { ApiSection } from '@/features/settings/sections/api-section.tsx';

const SettingsScreen = () => {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-8'>
      <div>
        <h1 className='text-2xl font-semibold'>Settings</h1>
        <p className='text-sm text-muted-foreground'>Manage your account preferences.</p>
      </div>

      <ApiSection />
    </div>
  );
};

export const Route = createFileRoute('/_app/settings')({
  component: SettingsScreen,
});
