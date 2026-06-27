import { Link } from '@tanstack/react-router';
import { RiArrowLeftLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button-variants';

export const NotFoundPage = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='border-b border-border bg-background'>
        <div className='max-w-5xl mx-auto px-6 h-14 flex items-center'>
          <Link to='/' className='font-mono text-primary font-semibold text-sm'>
            daily.md
          </Link>
        </div>
      </header>
      <div className='flex-1 flex flex-col items-center justify-center text-center px-6'>
        <span className='text-8xl font-semibold font-mono text-primary'>404</span>
        <h1 className='text-xl font-semibold mt-4'>Page not found</h1>
        <p className='text-sm text-muted-foreground mt-2'>This page doesn't exist or was moved.</p>
        <Link
          to='/'
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mt-6 gap-1.5')}
        >
          <RiArrowLeftLine className='size-4' />
          Go home
        </Link>
      </div>
    </div>
  );
};
