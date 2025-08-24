'use client'
import { UserCircle, User } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { createClient } from '../../supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserProfile() {
    const supabase = createClient()
    const router = useRouter()

    const handleSignOut = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserCircle className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}