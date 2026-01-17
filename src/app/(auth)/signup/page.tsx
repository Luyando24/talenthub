import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default function SignupPage() {
    return (
        <div className="space-y-6">
            <Suspense fallback={<div>Loading...</div>}>
                <SignupForm />
            </Suspense>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
