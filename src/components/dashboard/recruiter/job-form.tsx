'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const jobFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    requirements: z.string().min(10, "Requirements must be at least 10 characters."),
    location: z.string().min(2, "Location is required."),
    industry: z.string().min(2, "Industry is required."),
    salaryRange: z.string().optional(),
    jobType: z.string(),
    questions: z.array(z.object({
        questionText: z.string().min(5, "Question must be at least 5 characters")
    }))
})

type JobFormValues = z.infer<typeof jobFormSchema>

export function JobForm() {
    const router = useRouter()
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobFormSchema),
        defaultValues: {
            title: "",
            description: "",
            requirements: "",
            location: "Lusaka, Zambia",
            industry: "",
            salaryRange: "",
            jobType: "Full-time",
            questions: []
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions"
    })

    async function onSubmit(data: JobFormValues) {
        if (!user) return
        setSaving(true)

        try {
            // 1. Insert Job
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .insert({
                    recruiter_id: user.id,
                    title: data.title,
                    description: data.description,
                    requirements: data.requirements,
                    location: data.location,
                    industry: data.industry,
                    salary_range: data.salaryRange || null,
                    job_type: data.jobType,
                    status: 'published'
                })
                .select()
                .single()

            if (jobError) throw jobError

            // 2. Insert Questions if any
            if (data.questions.length > 0 && jobData) {
                const questionsToInsert = data.questions.map(q => ({
                    job_id: jobData.id,
                    question_text: q.questionText,
                    is_required: true
                }))

                const { error: qError } = await supabase
                    .from('job_questions')
                    .insert(questionsToInsert)

                if (qError) {
                    console.error("Failed to save questions", qError)
                    toast.error("Job posted, but failed to save questions.")
                }
            }

            toast.success("Job posted successfully!")
            router.push("/dashboard/recruiter")
        } catch (error) {
            console.error(error)
            toast.error("Failed to post job.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl pb-10">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Lusaka, Zambia" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Finance, Mining" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="jobType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select job type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="salaryRange"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Salary Range (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. K15,000 - K20,000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the role responsibilities..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Requirements</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="List the key requirements..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                You can paste a list here.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <FormLabel className="text-base">Screening Questions (Optional)</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ questionText: "" })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                        </Button>
                    </div>

                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            No questions added. Candidates will just submit their profile.
                        </p>
                    )}

                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
                            <FormField
                                control={form.control}
                                name={`questions.${index}.questionText`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder={`Question ${index + 1}`} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="mt-0"
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post Job
                </Button>
            </form>
        </Form>
    )
}
