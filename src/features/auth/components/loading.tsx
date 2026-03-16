import { Spinner } from '@/components/ui/spinner';

export const Loading = () => {
  return (
    <>
      <div className='min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center text-center px-6'>
        <div className='flex flex-col items-center gap-4 text-center animate-in fade-in duration-500'>
          <div className='flex items-center justify-center'>
            <Spinner className='size-7' />
          </div>

          <div className='flex flex-col gap-1.5'>
            <h2 className='text-xl font-semibold tracking-tight text-slate-900'>
              Finalizing sign in
            </h2>
            <p className='text-sm text-slate-500'>This will just take a moment…</p>
          </div>
        </div>
      </div>
    </>
  );
};
