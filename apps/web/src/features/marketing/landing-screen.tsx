import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils.ts';
import { buttonVariants } from '@/components/ui/button.tsx';
import { RiArrowRightLine } from '@remixicon/react';

export const LandingPage = () => {
  return (
    <>
      <div className='min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center text-center px-6'>
        <span className='font-mono text-primary text-sm mb-4'>#daily.md</span>
        <h1 className='text-4xl font-semibold tracking-tight'>Write your day in Markdown.</h1>
        <p className='text-muted-foreground mt-3'>Private. Fast. No fuss.</p>
        <Link to='/login' className={cn(buttonVariants({ size: 'default' }), 'mt-8 gap-2')}>
          Get started
          <RiArrowRightLine className='size-4' />
        </Link>
      </div>
    </>
  );
};
