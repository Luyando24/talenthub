import { ProfileForm } from "@/components/dashboard/candidate/profile-form"
import { Separator } from "@/components/ui/separator"

export default function CandidateProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">My Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your personal information, skills, and resume. This information will be shared with recruiters when you apply.
                </p>
            </div>
            <Separator />
            <ProfileForm />
        </div>
    )
}
