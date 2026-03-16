import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Link } from '@tanstack/react-router';

interface UserAvatarProps {
  profilePicture: string | null;
}

export const UserAvatar = ({ profilePicture }: UserAvatarProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className='rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
          <Avatar className='size-8 cursor-pointer'>
            <AvatarImage src={profilePicture ?? undefined} alt='Profile picture' />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem>
          <Link to='.'>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to='/logout'>Logout</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
