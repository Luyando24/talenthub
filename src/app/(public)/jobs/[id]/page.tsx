import { createClient } from "@/utils/supabase/server"
import { Job } from "@/types"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Building2, MapPin, CalendarDays, Wallet } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ApplySection } from "@/components/jobs/apply-section"
import { ShareJobButton } from "@/components/jobs/share-job-button"

export const dynamic = "force-dynamic"

interface JobPageProps {
    params: Promise<{ id: string }>
}

export default async function JobPage({ params }: JobPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !job) {
        notFound()
    }

    // Fetch recruiter details manually
    const { data: recruiter } = await supabase
        .from("recruiter_profiles")
        .select("company_name, company_website, is_approved")
        .eq("id", job.recruiter_id)
        .single()

    const jobWithRecruiter = {
        ...job,
        recruiter: recruiter || { company_name: "Unknown" }
    }

    // Type casting
    const typedJob = jobWithRecruiter as unknown as (Job & { recruiter: { company_name: string; company_website?: string }, company_name?: string | null })

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{typedJob.title}</h1>
                            <ShareJobButton 
                                jobId={typedJob.id} 
                                jobTitle={typedJob.title} 
                                companyName={typedJob.company_name || typedJob.recruiter?.company_name || "Unknown Company"} 
                                size="default"
                                variant="outline"
                            />
                        </div>
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
                <div className="grid gap-10 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px] mb-20 md:mb-0">
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold">About the Role</h2>
                            <div 
                                className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                dangerouslySetInnerHTML={{ __html: typedJob.description }}
                            />
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold">Requirements</h2>
                            <div 
                                className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                dangerouslySetInnerHTML={{ __html: typedJob.requirements }}
                            />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold">Job Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Location</p>
                                        <p className="text-sm text-muted-foreground">{typedJob.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Job Type</p>
                                        <p className="text-sm text-muted-foreground">{typedJob.job_type}</p>
                                    </div>
                                </div>
                                {typedJob.salary_range && (
                                    <div className="flex items-start gap-3">
                                        <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium">Salary</p>
                                            <p className="text-sm text-muted-foreground">{typedJob.salary_range}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Posted</p>
                                        <p className="text-sm text-muted-foreground">{new Date(typedJob.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="pt-2 hidden md:block">
                                <ApplySection jobId={typedJob.id} />
                            </div>
                        </div>

                        {/* Company Card */}
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold">About the Company</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{typedJob.company_name || typedJob.recruiter?.company_name}</span>
                                </div>
                                {typedJob.recruiter?.company_website && (
                                    <a 
                                        href={typedJob.recruiter.company_website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline block"
                                    >
                                        Visit Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Apply Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t md:hidden z-50">
                    <ApplySection jobId={typedJob.id} />
                </div>
            </div>
        </div>
    )
}
