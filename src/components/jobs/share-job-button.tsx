'use client'

import { Button } from "@/components/ui/button"
import { Share2, Check, Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareJobButtonProps {
    jobId: string
    jobTitle: string
    companyName: string
    size?: "default" | "sm" | "lg" | "icon"
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    className?: string
}

export function ShareJobButton({ jobId, jobTitle, companyName, size = "icon", variant = "ghost", className }: ShareJobButtonProps) {
    const [copied, setCopied] = useState(false)

    const jobUrl = typeof window !== 'undefined' ? `${window.location.origin}/jobs/${jobId}` : ''

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(jobUrl)
            setCopied(true)
            toast.success("Link copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Failed to copy link")
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${jobTitle} at ${companyName}`,
                    text: `Check out this ${jobTitle} position at ${companyName} on Talent Hub!`,
                    url: jobUrl,
                })
            } catch (err) {
                // Ignore abort errors (user cancelled)
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err)
                    // Fallback to copy link if share fails/is not supported
                    handleCopyLink()
                }
            }
        } else {
            handleCopyLink()
        }
    }

    // If using the icon size, we often just want a direct click action or a dropdown
    // For simplicity, let's use a dropdown to give options if we want to expand later,
    // but for now a direct click that tries native share first then copy is best for UX.
    // However, users might prefer explicit "Copy Link" vs "Share".
    // Let's stick to the "Try Native Share, else Copy" approach as the primary action,
    // but maybe we can offer a dropdown if we want to be fancy. 
    // Given the prompt "Add an option to share", a simple button is usually sufficient.

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleShare()
            }}
            title="Share Job"
        >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {size !== "icon" && <span className="ml-2">Share</span>}
        </Button>
    )
}
