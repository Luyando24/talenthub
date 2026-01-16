import { JobForm } from "@/components/dashboard/recruiter/job-form"
import { Separator } from "@/components/ui/separator"

export default function NewJobPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Post a New Job</h3>
                <p className="text-sm text-muted-foreground">
                    Create a job listing. Once posted, it will be visible to all candidates if your account is approved.
                </p>
            </div>
            <Separator />
            <JobForm />
        </div>
    )
}
