import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Suspense } from "react"

export default function LoginPage() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your credentials to access your account
                </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                    Sign up
                </Link>
            </p>
        </div>
    )
}
