import { createClient } from "@/utils/supabase/server"
import { JobCard } from "@/components/jobs/job-card"
import { SearchJobs } from "@/components/jobs/search-jobs"
import { Job } from "@/types"

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
        .select("*, recruiter:recruiter_profiles(company_name)")
        .eq("status", "published")
        .order("created_at", { ascending: false })

    if (query) {
        jobsQuery = jobsQuery.ilike("title", `%${query}%`)
    }

    const { data: jobs, error } = await jobsQuery

    // Manual type casting since we know the structure but Supabase types aren't auto-generated yet
    const typedJobs = (jobs || []) as unknown as (Job & { recruiter: { company_name: string } })[]

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Open Positions</h1>
                        <p className="text-muted-foreground mt-2">
                            Find your next career opportunity in Zambia.
                        </p>
                    </div>
                    <SearchJobs />
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                        Failed to load jobs. Please try again later.
                    </div>
                )}

                {typedJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
                        <h3 className="text-lg font-semibold">No jobs found</h3>
                        <p className="text-muted-foreground">
                            {query ? `No results for "${query}"` : "There are no open positions at the moment."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {typedJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
