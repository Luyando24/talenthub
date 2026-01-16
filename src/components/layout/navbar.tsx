'use client'

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { UserDropdown } from "@/components/layout/user-dropdown"
import { Menu } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

export function Navbar() {
    const { user, isLoading } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const NavLinks = () => (
        <>
            <Link href="/jobs" className="text-sm font-medium transition-colors hover:text-primary">
                Find Jobs
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
                About
            </Link>
        </>
    )

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-6">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="text-lg font-bold tracking-tight">Talent Hub</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <NavLinks />
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    ) : user ? (
                        <UserDropdown />
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Sign up</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-6 mt-6">
                                <Link href="/" onClick={() => setIsOpen(false)} className="font-bold">
                                    Talent Hub
                                </Link>
                                <div className="flex flex-col gap-4">
                                    <Link href="/jobs" onClick={() => setIsOpen(false)} className="text-sm font-medium hover:text-primary">
                                        Find Jobs
                                    </Link>
                                    <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium hover:text-primary">
                                        About
                                    </Link>
                                </div>
                                {!user && (
                                    <div className="flex flex-col gap-2 mt-4">
                                        <Link href="/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full">Log in</Button>
                                        </Link>
                                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full">Sign up</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
