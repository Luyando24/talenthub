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
import { Loader2, Upload, FileText, Trash2, ExternalLink } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
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

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        
        // Improved Validation
        const validTypes = ['application/pdf']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!validTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload a PDF file.")
            return
        }

        if (file.size > maxSize) {
            toast.error(`File size too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`)
            return
        }

        setUploading(true)
        setUploadProgress(0)

        try {
            // Simulate progress since Supabase client upload doesn't expose progress events easily in this version
            // For real progress, we'd need to use XMLHttpRequest or a library like axios wrapping the upload
            // Or if we were using TUS. For now, we simulate a smooth progress bar.
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            const fileExt = file.name.split('.').pop()
            const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file)

            clearInterval(progressInterval)
            setUploadProgress(100)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath)

            form.setValue('resumeUrl', publicUrl)
            toast.success("Resume uploaded successfully!")
        } catch (error) {
            console.error('Upload error:', error)
            toast.error("Failed to upload resume. Please try again.")
            setUploadProgress(0)
        } finally {
            setUploading(false)
            // Reset progress after a short delay to hide bar nicely
            setTimeout(() => setUploadProgress(0), 1000)
        }
    }

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Information Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LinkedIn URL (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
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
                                <FormLabel>Bio / Summary</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell recruiters about yourself..."
                                        className="resize-none min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Briefly describe your professional background and goals.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Skills & Resume Section */}
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Professional Details</h4>
                    
                    <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Skills</FormLabel>
                                <FormControl>
                                    <Input placeholder="React, Node.js, Project Management, Sales" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Separate skills with commas.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="resumeUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resume / CV</FormLabel>
                                <FormControl>
                                    <div className="space-y-4">
                                        <Input 
                                            type="hidden" 
                                            {...field} 
                                        />
                                        
                                        {/* Upload Button Area */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('resume-upload')?.click()}
                                                    disabled={uploading}
                                                >
                                                    {uploading ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4 mr-2" />
                                                    )}
                                                    {uploading ? "Uploading..." : "Upload PDF Resume"}
                                                </Button>
                                                <input
                                                    id="resume-upload"
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />
                                                <span className="text-xs text-muted-foreground">Max 5MB (PDF only)</span>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            {uploading && (
                                                <div className="space-y-1">
                                                    <Progress value={uploadProgress} className="h-2 w-full max-w-md" />
                                                    <p className="text-xs text-muted-foreground text-right max-w-md">{uploadProgress}%</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Preview Area */}
                                        {field.value && (
                                            <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50 max-w-md">
                                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">Current Resume</p>
                                                    <a 
                                                        href={field.value} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        View File <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() => form.setValue('resumeUrl', '')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={saving || loading}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    )
}
