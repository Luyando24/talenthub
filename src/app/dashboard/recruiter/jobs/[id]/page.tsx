import { ApplicantsTable } from "@/components/dashboard/recruiter/applicants-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/utils/supabase/server"
import { ArrowLeft, Ban, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

interface ManageJobPageProps {
    params: Promise<{ id: string }>
}

export default async function ManageJobPage({ params }: ManageJobPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch job and verify ownership
    const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !job) {
        notFound()
    }

    if (job.recruiter_id !== user.id) {
        // Basic authorization check (RLS handles fetch but good to catch early)
        return <div className="p-8 text-center text-destructive">Unauthorized access</div>
    }

    // Fetch applicants
    // We need to join: application -> candidate profile (for resume/skills) AND application -> user profile (for name/email)
    // Supabase join syntax:
    // applications ( ..., candidate:profiles(full_name, email), candidate_profile:candidate_profiles(...) )

    const { data: applications, error: appsError } = await supabase
        .from("applications")
        .select(`
        id,
        status,
        created_at,
        resume_url,
        candidate:candidate_id(full_name, email),
        candidate_profile:candidate_profiles(linkedin_url, skills, location, resume_url)
    `)
        .eq("job_id", id)
        .order("created_at", { ascending: false })

    if (appsError) {
        console.error(appsError)
    }

    // Manual casting for type safety in component
    const typedApplicants = (applications || []).map(app => ({
        ...app,
        // Handle array vs single object returns from joins if necessary, but syntax above implies single objects
        candidate: Array.isArray(app.candidate) ? app.candidate[0] : app.candidate,
        candidate_profile: Array.isArray(app.candidate_profile) ? app.candidate_profile[0] : app.candidate_profile
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/recruiter/jobs">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{job.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>{job.status}</Badge>
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <div className="border rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-bold">{typedApplicants.length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Applicants</div>
                </div>
                <div className="border rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {typedApplicants.filter(a => a.status === 'shortlisted' || a.status === 'hired').length}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Shortlisted
                    </div>
                </div>
                <div className="border rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {typedApplicants.filter(a => a.status === 'pending').length}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending
                    </div>
                </div>
                <div className="border rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {typedApplicants.filter(a => a.status === 'rejected').length}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Ban className="h-3 w-3" /> Rejected
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Applicants</h3>
                <ApplicantsTable applicants={typedApplicants as any} />
            </div>
        </div>
    )
}
