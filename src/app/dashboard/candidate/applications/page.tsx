import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createClient } from "@/utils/supabase/server"
import { Building2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CandidateApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: applications } = await supabase
        .from("applications")
        .select(`
        id,
        status,
        created_at,
        job:jobs(id, title, location, job_type, recruiter:recruiter_profiles(company_name))
    `)
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false })

    // Type casting for joined data
    const typedApps = (applications || []).map(app => {
        const job = Array.isArray(app.job) ? app.job[0] : app.job
        const recruiter = Array.isArray(job.recruiter) ? job.recruiter[0] : job.recruiter

        return {
            ...app,
            job: {
                ...job,
                recruiter
            }
        }
    })

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">My Applications</h3>
                <p className="text-sm text-muted-foreground">
                    Track the status of your job applications.
                </p>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job Role</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Applied On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {typedApps.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    You haven't applied to any jobs yet.
                                    <Link href="/jobs" className="text-primary hover:underline ml-1">Find a job</Link>
                                </TableCell>
                            </TableRow>
                        ) : (
                            typedApps.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{app.job.title}</span>
                                            <span className="text-xs text-muted-foreground md:hidden">{app.job.recruiter?.company_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3 w-3 text-muted-foreground" />
                                            {app.job.recruiter?.company_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            app.status === 'shortlisted' ? 'default' :
                                                app.status === 'rejected' ? 'destructive' :
                                                    app.status === 'hired' ? 'outline' : 'secondary'
                                        }>
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/jobs/${app.job.id}`}>
                                            <Button size="sm" variant="ghost">
                                                View Job <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
