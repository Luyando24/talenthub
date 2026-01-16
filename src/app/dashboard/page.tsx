import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    
    // If profile is missing (e.g. user deleted from DB but session remains), force logout/redirect
    if (!profile) {
        // We can't easily sign out from server component without redirecting to a route handler
        // For now, redirect to login which will eventually clear session if invalid
        redirect("/login")
    }

    if (profile.role === "RECRUITER") {
        redirect("/dashboard/recruiter")
    } else if (profile.role === "ADMIN") {
        redirect("/dashboard/admin")
    } else {
        redirect("/dashboard/candidate")
    }
}
