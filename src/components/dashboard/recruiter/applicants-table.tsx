'use client'

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createClient } from "@/utils/supabase/client"
import { Check, X, Loader2, Download, ExternalLink, Eye, MapPin, Phone } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

interface Applicant {
    id: string
    status: 'pending' | 'shortlisted' | 'rejected' | 'hired'
    created_at: string
    resume_url?: string
    candidate: {
        full_name: string
        email: string
    }
    candidate_profile: {
        linkedin_url?: string
        skills: string[]
        location?: string
        resume_url?: string
        bio?: string
        phone_number?: string
    }
}

interface ApplicantsTableProps {
    applicants: Applicant[]
}

interface ApplicationDetails extends Applicant {
    answers: {
        question: string
        answer: string
    }[]
}

export function ApplicantsTable({ applicants: initialApplicants }: ApplicantsTableProps) {
    const [applicants, setApplicants] = useState(initialApplicants)
    const [processing, setProcessing] = useState<string | null>(null)
    const [selectedApp, setSelectedApp] = useState<ApplicationDetails | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const supabase = createClient()

    async function handleStatusUpdate(id: string, newStatus: Applicant['status']) {
        setProcessing(id)
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
            toast.success(`Applicant ${newStatus}`)
        } catch (error) {
            console.error(error)
            toast.error("Failed to update status")
        } finally {
            setProcessing(null)
        }
    }

    const handleViewDetails = async (app: Applicant) => {
        setIsSheetOpen(true)
        setIsLoadingDetails(true)
        setSelectedApp({ ...app, answers: [] }) // Set base info immediately

        // Fetch answers
        const { data: answersData, error } = await supabase
            .from('application_answers')
            .select(`
            answer_text,
            question:job_questions(question_text)
        `)
            .eq('application_id', app.id)

        if (error) {
            console.error("Error fetching answers", error)
            toast.error("Could not load application answers")
        } else {
            // Process answers: question is an object or array due to join?
            // Based on Supabase returns: question: { question_text: ... }
            const formattedAnswers = (answersData || []).map((a: any) => ({
                question: a.question?.question_text || "Unknown Question",
                answer: a.answer_text
            }))
            setSelectedApp(prev => prev ? { ...prev, answers: formattedAnswers } : null)
        }
        setIsLoadingDetails(false)
    }

    if (applicants.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-md border-dashed">
                No applicants yet.
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Applied</TableHead>
                            <TableHead>Resume</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applicants.map((app) => {
                            const resume = app.resume_url || app.candidate_profile.resume_url
                            return (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="font-medium">{app.candidate.full_name}</div>
                                        <div className="text-xs text-muted-foreground">{app.candidate.email}</div>
                                    </TableCell>
                                    <TableCell>{app.candidate_profile.location || 'N/A'}</TableCell>
                                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {resume ? (
                                            <a href={resume} target="_blank" className="flex items-center gap-1 text-sm hover:underline text-blue-600">
                                                <Download className="h-4 w-4" /> CV
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            app.status === 'shortlisted' ? 'default' :
                                                app.status === 'rejected' ? 'destructive' :
                                                    app.status === 'hired' ? 'outline' : 'secondary'
                                        }>
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleViewDetails(app)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {app.status !== 'rejected' && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                title="Reject"
                                                disabled={processing === app.id}
                                                onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                            >
                                                {processing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                            </Button>
                                        )}
                                        {app.status !== 'shortlisted' && app.status !== 'hired' && (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                title="Shortlist"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={processing === app.id}
                                                onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                                            >
                                                {processing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Application Details</SheetTitle>
                        <SheetDescription>
                            Review candidate information and answers.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedApp && (
                        <div className="mt-6 space-y-6">
                            {/* Status Bar */}
                            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Current Status</p>
                                    <Badge className="mt-1">{selectedApp.status}</Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}>Reject</Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(selectedApp.id, 'shortlisted')}>Shortlist</Button>
                                </div>
                            </div>

                            {/* Candidate Info */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{selectedApp.candidate.full_name}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {selectedApp.candidate_profile.location || "Location not provided"}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        {selectedApp.candidate_profile.phone_number || "Phone not provided"}
                                    </div>
                                </div>
                                {selectedApp.candidate_profile.linkedin_url && (
                                    <a href={selectedApp.candidate_profile.linkedin_url} target="_blank" className="flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                                        <ExternalLink className="h-4 w-4" /> LinkedIn Profile
                                    </a>
                                )}
                            </div>

                            {/* Bio */}
                            {selectedApp.candidate_profile.bio && (
                                <div>
                                    <h4 className="font-medium mb-1">About</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedApp.candidate_profile.bio}</p>
                                </div>
                            )}

                            {/* Skills */}
                            {selectedApp.candidate_profile.skills && selectedApp.candidate_profile.skills.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApp.candidate_profile.skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Screening Questions */}
                            <div>
                                <h4 className="font-medium mb-3">Screening Questions</h4>
                                {isLoadingDetails ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading answers...
                                    </div>
                                ) : selectedApp.answers.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedApp.answers.map((qa, i) => (
                                            <div key={i} className="bg-muted/30 p-3 rounded-md">
                                                <p className="text-sm font-medium mb-1">{qa.question}</p>
                                                <p className="text-sm text-muted-foreground">{qa.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No screening questions for this job.</p>
                                )}
                            </div>

                            {/* Resume */}
                            {(selectedApp.resume_url || selectedApp.candidate_profile.resume_url) && (
                                <div className="pt-4 border-t">
                                    <a
                                        href={selectedApp.resume_url || selectedApp.candidate_profile.resume_url}
                                        target="_blank"
                                        className="w-full"
                                    >
                                        <Button variant="outline" className="w-full">
                                            <Download className="mr-2 h-4 w-4" /> Download Resume
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
