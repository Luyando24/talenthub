'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { Loader2, User, Briefcase, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

import { signupAction } from "@/app/actions"

const formSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
})

type Step = 'role-selection' | 'form'

export function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<Step>('role-selection')
    // const supabase = createClient() // No longer used for signup directly

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "CANDIDATE",
        },
    })

    useEffect(() => {
        const roleParam = searchParams.get("role")
        if (roleParam === "recruiter" || roleParam === "RECRUITER") {
            form.setValue("role", "RECRUITER")
            setStep('form')
        } else if (roleParam === "candidate" || roleParam === "CANDIDATE") {
            form.setValue("role", "CANDIDATE")
            setStep('form')
        }
    }, [searchParams, form])

    const selectedRole = form.watch("role")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Attempting signup with values:", values)
        setIsLoading(true)

        const result = await signupAction(values)

        if (result.error) {
            console.error("Signup error:", result.error)
            toast.error(`Signup failed: ${result.error}`)
            setIsLoading(false)
            return
        }

        toast.success("Account created successfully")
        router.refresh()
        router.push("/dashboard")
        setIsLoading(false)
    }

    const handleRoleSelect = (role: "CANDIDATE" | "RECRUITER") => {
        form.setValue("role", role)
        setStep('form')
    }

    if (step === 'role-selection') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <button
                        onClick={() => handleRoleSelect("CANDIDATE")}
                        className="flex flex-col items-center justify-center p-8 space-y-4 text-center transition-all bg-white border-2 border-transparent rounded-xl shadow-md hover:border-green-500 hover:shadow-lg hover:scale-[1.02] group dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="p-4 transition-colors rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">I'm a Job Seeker</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Find jobs and build your career
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect("RECRUITER")}
                        className="flex flex-col items-center justify-center p-8 space-y-4 text-center transition-all bg-white border-2 border-transparent rounded-xl shadow-md hover:border-blue-500 hover:shadow-lg hover:scale-[1.02] group dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="p-4 transition-colors rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">I'm an Employer</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Post jobs and hire talent
                            </p>
                        </div>
                    </button>
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Select an option to continue
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="pl-0 text-muted-foreground hover:text-foreground mb-4"
                    onClick={() => setStep('role-selection')}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to selection
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">
                    {selectedRole === "CANDIDATE" ? "Create Candidate Profile" : "Create Employer Account"}
                </h2>
                <p className="text-muted-foreground">
                    {selectedRole === "CANDIDATE"
                        ? "Join thousands of professionals finding meaningful work."
                        : "Start hiring the best talent in Zambia today."}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder={selectedRole === "CANDIDATE" ? "Banda John" : "Company Representative Name"} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Role is hidden but controlled via step 1 */}
                    <input type="hidden" {...form.register("role")} />

                    <Button type="submit" className={cn("w-full transition-all", selectedRole === "RECRUITER" ? "bg-blue-600 hover:bg-blue-700" : "")} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create {selectedRole === "CANDIDATE" ? "Profile" : "Account"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
