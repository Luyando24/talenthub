import { JobForm } from "@/components/dashboard/recruiter/job-form"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminNewJobPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect("/login")

    // Double check admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') redirect("/dashboard")

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Post a New Job (Admin)</h3>
                <p className="text-sm text-muted-foreground">
                    Create a job listing on behalf of a company.
                </p>
            </div>
            <Separator />
            <JobForm />
        </div>
    )
}
