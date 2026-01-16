import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { Briefcase, Plus, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function RecruiterDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch recruiter profile and stats
    const [profileRes, jobsRes] = await Promise.all([
        supabase
            .from("recruiter_profiles")
            .select("*")
            .eq("id", user.id)
            .single(),
        supabase
            .from("jobs")
            .select("id, status, title, created_at", { count: 'exact' })
            .eq("recruiter_id", user.id)
    ])

    const profile = profileRes.data
    const jobs = jobsRes.data || []
    const jobCount = jobsRes.count || 0

    if (!profile) {
        // Logic to handle missing profile (should create one)
        return <div>Recruiter profile not found. Please contact support.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h2>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/recruiter/jobs/new">
                        <Button disabled={!profile.is_approved}>
                            <Plus className="mr-2 h-4 w-4" />
                            Post New Job
                        </Button>
                    </Link>
                </div>
            </div>

            {!profile.is_approved && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                Your account is currently pending approval. You can create jobs, but they won't be visible to candidates until an admin approves your account.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Jobs
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total jobs posted
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Applicants
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            Across all jobs
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Job Postings</CardTitle>
                </CardHeader>
                <CardContent>
                    {jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <p>No jobs posted yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.slice(0, 5).map(job => (
                                <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-medium">{job.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Posted on {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {job.status}
                                        </span>
                                        <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
                                            <Button variant="ghost" size="sm">Manage</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
