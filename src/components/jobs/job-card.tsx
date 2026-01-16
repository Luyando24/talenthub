'use client'

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Job } from "@/types"
import { Briefcase, MapPin, Heart } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { stripHtml } from "@/lib/utils-html"

interface JobCardProps {
    job: Job & { recruiter?: { company_name: string }, company_name?: string | null }
}

export function JobCard({ job }: JobCardProps) {
    const { user } = useAuth()
    const supabase = createClient()
    const [isSaved, setIsSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const checkSavedStatus = async () => {
            if (!user) return
            // Skip check for mock data to avoid UUID errors
            if (job.id.startsWith('mock-')) return

            const { data, error } = await supabase
                .from('saved_jobs')
                .select('id')
                .eq('job_id', job.id)
                .eq('candidate_id', user.id)
                .single()

            if (!error && data) {
                setIsSaved(true)
            }
        }

        checkSavedStatus()
    }, [user, job.id, supabase])

    const handleSave = async () => {
        if (!user) {
            toast.error("Please log in to save jobs")
            return
        }

        // Prevent saving mock jobs
        if (job.id.startsWith('mock-')) {
            toast.info("This is a demo job and cannot be saved.")
            return
        }

        setIsLoading(true)
        try {
            if (isSaved) {
                // Unsave
                const { error } = await supabase
                    .from('saved_jobs')
                    .delete()
                    .eq('job_id', job.id)
                    .eq('candidate_id', user.id)

                if (error) throw error
                setIsSaved(false)
                toast.success("Job removed from saved list")
            } else {
                // Save
                const { error } = await supabase
                    .from('saved_jobs')
                    .insert({ candidate_id: user.id, job_id: job.id })

                if (error) throw error
                setIsSaved(true)
                toast.success("Job saved successfully")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to update saved status")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="flex flex-col h-full hover:border-primary/50 transition-colors relative group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0 pr-2">
                        <CardTitle className="text-lg font-bold line-clamp-2 leading-tight" title={job.title}>{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1.5 text-sm truncate">
                            {job.company_name || job.recruiter?.company_name || "Unknown Company"}
                        </CardDescription>
                    </div>
                    
                    {/* Actions positioned top-right, but prevented from overflowing */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleSave()
                            }}
                            disabled={isLoading}
                            className="h-8 w-8 rounded-full hover:bg-muted"
                        >
                            <Heart className={cn("h-4 w-4", isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                        </Button>
                        <Link href={`/jobs/${job.id}`}>
                            <Button size="sm" className="h-8 px-3 text-xs">Apply</Button>
                        </Link>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={job.job_type === 'Full-time' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0 h-5">
                        {job.job_type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.location || "Lusaka"}
                    </div>
                    {job.salary_range && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            {job.salary_range}
                        </div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(job.description)}</p>
            </CardContent>
        </Card>
    )
}
