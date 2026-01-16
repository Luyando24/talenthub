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
        <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold line-clamp-1">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 text-base">
                            {job.company_name || job.recruiter?.company_name || "Unknown Company"}
                        </CardDescription>
                    </div>
                    <Badge variant={job.job_type === 'Full-time' ? 'default' : 'secondary'} className="shrink-0">
                        {job.job_type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location || "Lusaka, Zambia"}
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {job.salary_range || "Competitive Salary"}
                    </div>
                    <p className="line-clamp-3 mt-2">{job.description}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="rounded-full hover:bg-muted"
                >
                    <Heart className={cn("h-5 w-5", isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                </Button>
                <Link href={`/jobs/${job.id}`}>
                    <Button>Apply Now</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
