import { Link } from '@tanstack/react-router';
import { SignInButton } from '@/features/auth/components/signin-button.tsx';

interface HeaderProps {
  showLogin: boolean;
}

export const Header = (props: HeaderProps) => {
  const { showLogin } = props;
  return (
    <>
      <header className='sticky top-0 z-50 border-b border-border bg-background'>
        <div className='max-w-5xl mx-auto px-6 h-14 flex items-center justify-between'>
          <Link to='/' className={'flex flex-row items-center gap-2'}>
            <img src={'/favicon_io/icon.png'} alt='logo' className='size-6 mb-1' />
            <div className='font-mono text-primary font-semibold text-sm'>daily.md</div>
          </Link>
          {showLogin && <SignInButton />}
        </div>
      </header>
    </>
  );
};
