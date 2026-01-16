'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/utils/supabase/client"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check } from "lucide-react"

interface ApplySectionProps {
    jobId: string
}

interface Question {
    id: string
    question_text: string
    is_required: boolean
}

export function ApplySection({ jobId }: ApplySectionProps) {
    const { user, profile, isLoading } = useAuth()
    const [isApplying, setIsApplying] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)
    const [checkingApplication, setCheckingApplication] = useState(false)
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [showQuestionsFor, setShowQuestionsFor] = useState(false) // toggle dialog
    const [showSuccessDialog, setShowSuccessDialog] = useState(false) // New success modal
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Only run check if we are sure we have a user and profile is loaded
        // But also, if isLoading is false and we have no user, we shouldn't be checking
        if (isLoading) return

        if (user && profile?.role === 'CANDIDATE') {
            const checkApplication = async () => {
                setCheckingApplication(true)
                try {
                    const { data } = await supabase
                        .from('applications')
                        .select('id')
                        .eq('job_id', jobId)
                        .eq('candidate_id', user.id)
                        .maybeSingle() // Use maybeSingle to avoid errors on no rows

                    if (data) setHasApplied(true)
                } catch (error) {
                    console.error("Error checking application status:", error)
                } finally {
                    setCheckingApplication(false)
                }
            }
            checkApplication()
        }
    }, [user, profile, isLoading, jobId, supabase])

    const fetchQuestions = async () => {
        const { data } = await supabase
            .from('job_questions')
            .select('*')
            .eq('job_id', jobId)

        return data || []
    }

    const initiateApply = async () => {
        if (!user) {
            router.push(`/login?next=/jobs/${jobId}`)
            return
        }

        if (profile?.role !== 'CANDIDATE') {
            toast.error("Only candidates can apply to jobs.")
            return
        }

        // Check if profile is complete (resume is mandatory)
        const { data: candidateProfile } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!candidateProfile?.resume_url) {
            toast.error("You must upload a resume to apply.")
            router.push('/dashboard/candidate/profile')
            return
        }

        // Fetch questions first
        setIsApplying(true)
        const qs = await fetchQuestions()

        if (qs.length > 0) {
            setQuestions(qs)
            setShowQuestionsFor(true)
            setIsApplying(false)
        } else {
            // No questions, direct apply
            submitApplication()
        }
    }

    const submitApplication = async () => {
        if (!user) {
            toast.error("You must be logged in to apply.")
            return
        }

        setIsApplying(true)
        try {
            // 1. Create application
            const { data: appData, error: appError } = await supabase
                .from('applications')
                .insert({
                    job_id: jobId,
                    candidate_id: user.id,
                    status: 'pending'
                })
                .select()
                .single()

            if (appError) throw appError

            // 2. Submit answers if any
            if (questions.length > 0 && appData) {
                const answersToInsert = questions.map(q => ({
                    application_id: appData.id,
                    question_id: q.id,
                    answer_text: answers[q.id] || ""
                }))

                const { error: ansError } = await supabase
                    .from('application_answers')
                    .insert(answersToInsert)

                if (ansError) {
                    console.error("Error saving answers", ansError)
                    // Non-fatal but bad
                }
            }

            toast.success("Application submitted successfully!")
            setHasApplied(true)
            setShowQuestionsFor(false)
            setShowSuccessDialog(true) // Trigger success modal
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit application.")
        } finally {
            setIsApplying(false)
        }
    }

    if (isLoading || checkingApplication) {
        return (
            <Button disabled className="w-full md:w-auto min-w-[150px]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking status...
            </Button>
        )
    }

    if (!user) {
        return (
            <Link href={`/login?next=/jobs/${jobId}`}>
                <Button size="lg" className="w-full md:w-auto min-w-[200px]">
                    Log in to Apply
                </Button>
            </Link>
        )
    }

    if (profile?.role === 'RECRUITER' || profile?.role === 'ADMIN') {
        return (
            <Button disabled variant="secondary" size="lg" className="w-full md:w-auto min-w-[200px]">
                Recruiters cannot apply
            </Button>
        )
    }

    if (hasApplied) {
        return (
            <Button disabled variant="outline" size="lg" className="w-full md:w-auto min-w-[200px] bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Applied
            </Button>
        )
    }

    return (
        <>
            <Button
                size="lg"
                onClick={initiateApply}
                disabled={isApplying}
                className="w-full md:w-auto min-w-[200px]"
            >
                {isApplying ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                    </>
                ) : (
                    "Apply Now"
                )}
            </Button>

            <Dialog open={showQuestionsFor} onOpenChange={setShowQuestionsFor}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Application Questions</DialogTitle>
                        <DialogDescription>
                            Please answer the following questions to complete your application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {questions.map((q) => (
                            <div key={q.id} className="grid gap-2">
                                <Label htmlFor={q.id}>{q.question_text}</Label>
                                <Textarea
                                    id={q.id}
                                    placeholder="Your answer..."
                                    value={answers[q.id] || ""}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={submitApplication} disabled={isApplying}>
                            {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                            <Check className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">Application Sent!</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Your application has been successfully submitted to the recruiter.
                            Good luck!
                        </DialogDescription>
                    </div>
                    <DialogFooter className="flex-col sm:justify-center gap-2">
                        <Link href="/jobs" className="w-full">
                            <Button variant="outline" className="w-full">Browse More Jobs</Button>
                        </Link>
                        <Link href="/dashboard/candidate/applications" className="w-full">
                            <Button className="w-full">Track Application</Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
