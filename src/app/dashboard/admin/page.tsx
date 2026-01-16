import { RecruiterApprovalList } from "@/components/dashboard/admin/recruiter-approval-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { Users, Building, ShieldAlert } from "lucide-react"
import { redirect } from "next/navigation"
import { RecruiterProfile } from "@/types"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Check if admin (double check)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') redirect("/dashboard")

    const [recruitersPending, stats] = await Promise.all([
        supabase.from("recruiter_profiles").select("*").eq("is_approved", false).order("created_at", { ascending: false }),
        supabase.rpc('admin_stats') // Assume RPC or just fetch counts separately
    ])

    // Fetching counts manually for MVP without RPC
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
    const { count: pendingCount } = await supabase.from('recruiter_profiles').select('*', { count: 'exact', head: true }).eq('is_approved', false)

    const pendingProfiles = (recruitersPending.data || []) as RecruiterProfile[]

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Recruiter Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecruiterApprovalList recruiters={pendingProfiles} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
