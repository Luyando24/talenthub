import { createClient } from "@/utils/supabase/server"
import { JobCard } from "@/components/jobs/job-card"
import { SearchJobs } from "@/components/jobs/search-jobs"
import { Job } from "@/types"
import { Search, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

export const dynamic = "force-dynamic"

interface JobsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const params = await searchParams
    const query = typeof params.q === "string" ? params.q : ""

    const supabase = await createClient()

    let jobsQuery = supabase
        .from("jobs")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })

    if (query) {
        jobsQuery = jobsQuery.ilike("title", `%${query}%`)
    }

    const { data: jobs, error } = await jobsQuery

    if (error) {
        console.error("Error fetching jobs:", error)
    }

    // Manual join to get recruiter profiles
    let jobsWithRecruiters: any[] = []
    
    if (jobs && jobs.length > 0) {
        const recruiterIds = Array.from(new Set(jobs.map(j => j.recruiter_id)))
        const { data: recruiters } = await supabase
            .from("recruiter_profiles")
            .select("id, company_name")
            .in("id", recruiterIds)
        
        const recruiterMap = new Map(recruiters?.map(r => [r.id, r]) || [])

        jobsWithRecruiters = jobs.map(job => ({
            ...job,
            recruiter: recruiterMap.get(job.recruiter_id) || { company_name: "Unknown" }
        }))
    }

    // Manual type casting since we know the structure but Supabase types aren't auto-generated yet
    const typedJobs = (jobsWithRecruiters || []) as unknown as (Job & { recruiter: { company_name: string } })[]

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-muted/5">
            <div className="container py-12 px-4 md:px-6 max-w-7xl mx-auto">
                <Breadcrumbs className="mb-6" />
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b pb-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Open Positions</h1>
                            <p className="text-muted-foreground max-w-[600px] text-lg">
                                Find your next career opportunity in Zambia.
                            </p>
                        </div>
                        <SearchJobs />
                    </div>

                    {error && (
                        <div className="rounded-lg border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-center gap-2">
                            <span className="font-semibold">Error:</span> Failed to load jobs. Please try again later.
                        </div>
                    )}

                    {typedJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/30">
                            <div className="bg-muted rounded-full p-4 mb-4">
                                <Briefcase className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                {query 
                                    ? `We couldn't find any positions matching "${query}". Try different keywords.` 
                                    : "There are no open positions at the moment. Please check back soon."}
                            </p>
                            {query && (
                                <Link href="/jobs">
                                    <Button variant="outline">
                                        Clear search
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            {typedJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
