'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, FileText, User, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface ProfileCompletionModalProps {
    completionPercentage: number
    missingFields: string[]
}

export function ProfileCompletionModal({ completionPercentage, missingFields }: ProfileCompletionModalProps) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Show modal if profile is incomplete (e.g., less than 80%)
        // and we haven't dismissed it in this session (optional logic)
        if (completionPercentage < 80) {
            // Small delay to be less intrusive on load
            const timer = setTimeout(() => setIsOpen(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [completionPercentage])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Complete Your Profile
                        <span className="text-sm font-normal text-muted-foreground ml-auto">
                            {completionPercentage}% Done
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Complete your profile to stand out to recruiters and apply to jobs faster.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <Progress value={completionPercentage} className="h-2" />
                    
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Missing Information:</h4>
                        <ul className="space-y-2">
                            {missingFields.map((field, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    {field}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Later
                    </Button>
                    <Link href="/dashboard/candidate/profile" className="w-full sm:w-auto">
                        <Button className="w-full">
                            Update Profile <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
