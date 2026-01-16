'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Link } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserDropdown() {
    const { user, profile, signOut } = useAuth()
    const router = useRouter()

    if (!user) return null

    const getDashboardLink = () => {
        if (profile?.role === 'ADMIN') return '/dashboard/admin'
        if (profile?.role === 'RECRUITER') return '/dashboard/recruiter'
        return '/dashboard/candidate'
    }

    const initials = profile?.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || user.email?.[0].toUpperCase() || 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                        <p className="text-muted-foreground text-xs leading-none">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                    Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`${getDashboardLink()}/profile`)}>
                    Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
