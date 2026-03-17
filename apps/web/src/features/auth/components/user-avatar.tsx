import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useNavigate } from '@tanstack/react-router';

interface UserAvatarProps {
  profilePicture: string | null;
}

export const UserAvatar = ({ profilePicture }: UserAvatarProps) => {
  const navigate = useNavigate();

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
        <DropdownMenuItem onClick={() => navigate({ to: '.' })}>Settings</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigate({ to: '/logout' }).then();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
