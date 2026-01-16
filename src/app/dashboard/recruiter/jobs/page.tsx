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
import { Briefcase, Eye, Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function RecruiterJobsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: jobs } = await supabase
        .from("jobs")
        .select("*, applications(count)")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manage Jobs</h2>
                    <p className="text-muted-foreground">
                        View and manage your job listings and applicants.
                    </p>
                </div>
                <Link href="/dashboard/recruiter/jobs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Post New Job
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Posted</TableHead>
                            <TableHead>Applicants</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No jobs found. Create your first job posting!
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs?.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                                            {job.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {job.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {job.applications?.[0]?.count || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
                                            <Button size="sm" variant="outline">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Manage
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
