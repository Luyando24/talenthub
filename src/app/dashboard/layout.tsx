'use client'

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { UserDropdown } from "@/components/layout/user-dropdown"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Desktop Sidebar - Hidden on mobile */}
            <DashboardSidebar className="hidden md:block" />

            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    {/* Mobile Menu Trigger */}
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72">
                            <DashboardSidebar
                                className="w-full border-r-0 bg-transparent min-h-0"
                                onLinkClick={() => setIsMobileOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2 font-semibold md:hidden">
                        <span>Talent Hub</span>
                    </Link>
                    <div className="flex-1">
                        {/* Breadcrumbs or Title */}
                    </div>
                    <UserDropdown />
                </header>
                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
