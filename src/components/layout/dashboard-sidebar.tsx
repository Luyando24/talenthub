'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Briefcase, LayoutDashboard, Settings, FileText, Users, Building } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function DashboardSidebar({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) {
    const pathname = usePathname()
    const { profile } = useAuth()
    const role = profile?.role

    const links = [
        {
            name: "Overview",
            href: "/dashboard", // Will redirect
            icon: LayoutDashboard,
            roles: ["CANDIDATE", "RECRUITER", "ADMIN"],
        },
        {
            name: "My Applications",
            href: "/dashboard/candidate/applications",
            icon: FileText,
            roles: ["CANDIDATE"],
        },
        {
            name: "Profile",
            href: "/dashboard/candidate/profile",
            icon: Users,
            roles: ["CANDIDATE"],
        },
        {
            name: "Manage Jobs",
            href: "/dashboard/recruiter/jobs",
            icon: Briefcase,
            roles: ["RECRUITER", "ADMIN"],
        },
        {
            name: "Applicants",
            href: "/dashboard/recruiter/applicants",
            icon: Users,
            roles: ["RECRUITER"],
        },
        {
            name: "Company Profile",
            href: "/dashboard/recruiter/profile",
            icon: Building,
            roles: ["RECRUITER"],
        },
        {
            name: "Recruiters",
            href: "/dashboard/admin/recruiters",
            icon: Building,
            roles: ["ADMIN"],
        },
    ]

    const filteredLinks = links.filter(link => role && link.roles.includes(role))

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-muted/20 w-64", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Dashboard
                    </h2>
                    <div className="space-y-1">
                        {filteredLinks.map((link) => (
                            <Link key={link.href} href={link.href} onClick={onLinkClick}>
                                <Button
                                    variant={pathname === link.href ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                >
                                    <link.icon className="mr-2 h-4 w-4" />
                                    {link.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
