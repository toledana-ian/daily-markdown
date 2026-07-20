import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { useExportNotes } from '@/features/notes/hooks/use-export-notes.ts';
import { useNavigate } from '@tanstack/react-router';

interface UserAvatarProps {
  profilePicture: string | null;
}

export const UserAvatar = ({ profilePicture }: UserAvatarProps) => {
  const navigate = useNavigate();
  const { exportNotes, isExporting } = useExportNotes();

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
      <DropdownMenuContent className={'rounded-sm shadow-xl'} align='end'>
        <DropdownMenuItem onClick={() => navigate({ to: '.' })}>Settings</DropdownMenuItem>
        <DropdownMenuItem
          disabled={isExporting}
          aria-busy={isExporting}
          aria-label={isExporting ? 'Exporting notes' : 'Export notes'}
          onClick={() => {
            void exportNotes();
          }}
        >
          {isExporting ? (
            <>
              <Spinner className='size-4' aria-hidden='true' />
              Exporting notes…
            </>
          ) : (
            'Export notes'
          )}
        </DropdownMenuItem>
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
