import { createClient } from "@/utils/supabase/server"
import { Job } from "@/types"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Building2, MapPin, CalendarDays, Wallet } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ApplySection } from "@/components/jobs/apply-section"

export const dynamic = "force-dynamic"

interface JobPageProps {
    params: Promise<{ id: string }>
}

export default async function JobPage({ params }: JobPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job, error } = await supabase
        .from("jobs")
        .select("*, recruiter:recruiter_profiles(company_name, company_website, is_approved)")
        .eq("id", id)
        .single()

    if (error || !job) {
        notFound()
    }

    // Type casting
    const typedJob = job as unknown as (Job & { recruiter: { company_name: string; company_website?: string }, company_name?: string | null })

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{typedJob.title}</h1>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span className="font-medium text-foreground">{typedJob.company_name || typedJob.recruiter?.company_name}</span>
                            </div>
                            <div className="hidden sm:block text-border">|</div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{typedJob.location}</span>
                            </div>
                            <div className="hidden sm:block text-border">|</div>
                            <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                <span>Posted {new Date(typedJob.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-sm py-1">
                                <Briefcase className="mr-1 h-3 w-3" />
                                {typedJob.job_type}
                            </Badge>
                            {typedJob.salary_range && (
                                <Badge variant="outline" className="text-sm py-1">
                                    <Wallet className="mr-1 h-3 w-3" />
                                    {typedJob.salary_range}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <ApplySection jobId={typedJob.id} />
                </div>

                <Separator />

                {/* Content */}
                <div className="grid gap-10 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px]">
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold">About the Role</h2>
                            <div className="prose prose-gray dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground">
                                {typedJob.description}
                            </div>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold">Requirements</h2>
                            <div className="prose prose-gray dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground">
                                {typedJob.requirements}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold">Company Info</h3>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">{typedJob.recruiter.company_name}</p>
                                {typedJob.recruiter.company_website && (
                                    <a
                                        href={typedJob.recruiter.company_website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline mt-1 block truncate"
                                    >
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
