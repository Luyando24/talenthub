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
import { Check, X, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { RecruiterProfile } from "@/types"

interface RecruiterApprovalListProps {
    recruiters: RecruiterProfile[]
}

export function RecruiterApprovalList({ recruiters: initialRecruiters }: RecruiterApprovalListProps) {
    const [recruiters, setRecruiters] = useState(initialRecruiters)
    const [processing, setProcessing] = useState<string | null>(null)
    const supabase = createClient()

    async function handleAction(id: string, approved: boolean) {
        setProcessing(id)
        try {
            const { error } = await supabase
                .from('recruiter_profiles')
                .update({
                    is_approved: approved,
                    // If rejecting, maybe mark as suspended or just leave not approved? 
                    // For now just toggle approved.
                    is_suspended: !approved && approved === false // If explicitly rejecting?
                })
                .eq('id', id)

            if (error) throw error

            setRecruiters(prev => prev.filter(r => r.id !== id))
            toast.success(approved ? "Recruiter approved" : "Recruiter rejected")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update status")
        } finally {
            setProcessing(null)
        }
    }

    if (recruiters.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
                No pending approvals.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recruiters.map((recruiter) => (
                        <TableRow key={recruiter.id}>
                            <TableCell className="font-medium">{recruiter.company_name}</TableCell>
                            <TableCell>
                                {recruiter.company_website ? (
                                    <a href={recruiter.company_website} target="_blank" className="text-primary hover:underline">
                                        View
                                    </a>
                                ) : 'N/A'}
                            </TableCell>
                            <TableCell>{new Date(recruiter.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    size="sm"
                                    variant="default"
                                    disabled={processing === recruiter.id}
                                    onClick={() => handleAction(recruiter.id, true)}
                                >
                                    {processing === recruiter.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={processing === recruiter.id}
                                    onClick={() => handleAction(recruiter.id, false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
