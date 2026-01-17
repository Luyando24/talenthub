'use client'

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import { cn } from "@/lib/utils"

interface BreadcrumbsProps {
    className?: string
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
    const pathname = usePathname()
    
    // Split pathname into segments, remove empty strings
    const segments = pathname.split('/').filter(Boolean)

    // Skip breadcrumbs on home page
    if (segments.length === 0) return null

    // Map segments to readable names (optional)
    const formatSegment = (segment: string) => {
        // Handle IDs (simple heuristic: mostly numbers or long mixed strings)
        // This is basic; for better results, fetch titles if needed, but for now we keep it simple
        if (segment.length > 20 || !isNaN(Number(segment))) {
            return "Details"
        }
        
        // Capitalize and replace hyphens
        return segment
            .replace(/-/g, ' ')
            .replace(/^\w/, c => c.toUpperCase())
    }

    // Generate breadcrumb items
    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = formatSegment(segment)
        
        return {
            href,
            label,
            isLast
        }
    })

    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-muted-foreground", className)}>
            <Link 
                href="/" 
                className="flex items-center hover:text-foreground transition-colors"
                title="Home"
            >
                <Home className="h-4 w-4" />
            </Link>
            
            {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
                    {crumb.isLast ? (
                        <span className="font-medium text-foreground">{crumb.label}</span>
                    ) : (
                        <Link 
                            href={crumb.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </Fragment>
            ))}
        </nav>
    )
}
