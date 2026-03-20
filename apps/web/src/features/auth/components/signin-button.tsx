import { cn } from '@/lib/utils.ts';
import { buttonVariants } from '@/components/ui/button-variants';
import { Link } from '@tanstack/react-router';

export const SignInButton = () => {
  return (
    <>
      <Link to='/login' className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
        Sign in
      </Link>
    </>
  );
};
