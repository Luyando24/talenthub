import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { Briefcase, CheckCircle, FileText, User } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CandidateDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch stats concurrently
    const [appsRes, profileRes] = await Promise.all([
        supabase
            .from("applications")
            .select("*", { count: 'exact', head: true })
            .eq("candidate_id", user.id),
        supabase
            .from("candidate_profiles")
            .select("*")
            .eq("id", user.id)
            .single()
    ])

    const applicationCount = appsRes.count || 0
    const profile = profileRes.data

    // Calculate profile completion (simple heuristic)
    let completionPercentage = 20 // Base for account
    if (profile?.full_name) completionPercentage += 20 // usually in base profile, but check here if needed or assume synced
    if (profile?.skills && profile.skills.length > 0) completionPercentage += 20
    if (profile?.resume_url) completionPercentage += 20
    if (profile?.location) completionPercentage += 10
    if (profile?.bio) completionPercentage += 10

    // Adjust max to 100
    completionPercentage = Math.min(completionPercentage, 100)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center gap-2">
                    <Link href="/jobs">
                        <Button>Find Jobs</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Applications
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applicationCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Jobs applied to
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Profile Completion
                        </CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completionPercentage}%</div>
                        <p className="text-xs text-muted-foreground">
                            {completionPercentage < 100 ? "Complete your profile to apply faster" : "Profile complete"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Interviews
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Upcoming interviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                        <CardDescription>
                            You count of applications this month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {applicationCount === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                                <Link href="/jobs"><Button variant="outline">Browse Jobs</Button></Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Placeholder for list */}
                                <p>Fetching applications list...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recommended Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">Based on your skills</p>
                        {/* Recommendation logic would go here */}
                        <div className="mt-4">
                            <Link href="/jobs" className="text-primary hover:underline text-sm">View all jobs</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
