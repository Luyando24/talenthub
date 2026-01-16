'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { CandidateProfile } from "@/types"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
    fullName: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    bio: z.string().max(500).optional(),
    location: z.string().min(2, {
        message: "Location is required.",
    }),
    skills: z.string().describe("Comma separated skills"),
    linkedin: z.string().url().optional().or(z.literal("")),
    resumeUrl: z.string().url().optional().or(z.literal("")),
    phoneNumber: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: "",
            bio: "",
            location: "Lusaka, Zambia",
            skills: "",
            linkedin: "",
            resumeUrl: "",
            phoneNumber: "",
        },
    })

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                // Fetch candidate profile specifically
                const { data, error } = await supabase
                    .from('candidate_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    form.setValue('fullName', profile.full_name)
                }

                if (data) {
                    const candidateData = data as CandidateProfile
                    form.setValue('bio', candidateData.bio || "")
                    form.setValue('location', candidateData.location || "Lusaka, Zambia")
                    form.setValue('skills', candidateData.skills?.join(", ") || "")
                    form.setValue('linkedin', candidateData.linkedin_url || "")
                    form.setValue('resumeUrl', candidateData.resume_url || "")
                    form.setValue('phoneNumber', candidateData.phone_number || "")
                }
                setLoading(false)
            }
            fetchProfile()
        }
    }, [user, profile, form, supabase])

    async function onSubmit(data: ProfileFormValues) {
        if (!user) return
        setSaving(true)

        try {
            // 1. Update basic profile
            await supabase
                .from('profiles')
                .update({ full_name: data.fullName })
                .eq('id', user.id)

            // 2. Upsert candidate profile
            const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean)

            const { error } = await supabase
                .from('candidate_profiles')
                .upsert({
                    id: user.id,
                    bio: data.bio,
                    location: data.location,
                    skills: skillsArray,
                    linkedin_url: data.linkedin || null,
                    resume_url: data.resumeUrl || null,
                    phone_number: data.phoneNumber || null,
                    updated_at: new Date().toISOString(),
                })

            if (error) {
                console.error(error)
                toast.error("Failed to update profile.")
            } else {
                toast.success("Profile updated successfully!")
            }
        } catch (error) {
            toast.error("An error occurred.")
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Banda" {...field} />
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
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+260 97 0000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us about yourself..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Brief summary of your professional background.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                                <Input placeholder="React, Node.js, Project Management (comma separated)" {...field} />
                            </FormControl>
                            <FormDescription>
                                Separate skills with commas.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="resumeUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resume URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    Link to your CV (Google Drive, Dropbox, etc.)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LinkedIn URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://linkedin.com/in/..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                </Button>
            </form>
        </Form>
    )
}
