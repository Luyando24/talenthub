'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { CandidateProfile } from "@/types"
import { Loader2, Upload, FileText, Trash2, ExternalLink, Plus, X, GraduationCap, Briefcase } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const educationSchema = z.object({
    school: z.string().min(2, "School name is required"),
    degree: z.string().min(2, "Degree is required"),
    field_of_study: z.string().min(2, "Field of study is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().optional(),
})

const workExperienceSchema = z.object({
    company: z.string().min(2, "Company name is required"),
    position: z.string().min(2, "Position is required"),
    location: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().optional(),
})

const profileFormSchema = z.object({
    fullName: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    bio: z.string().max(500).optional(),
    location: z.string().min(2, {
        message: "Location is required.",
    }),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    linkedin: z.string().url().optional().or(z.literal("")),
    resumeUrl: z.string().url().optional().or(z.literal("")),
    phoneNumber: z.string().optional(),
    education: z.array(educationSchema).optional(),
    work_experience: z.array(workExperienceSchema).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const supabase = createClient()

    const [skillInput, setSkillInput] = useState("")

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: "",
            bio: "",
            location: "Lusaka, Zambia",
            skills: [],
            linkedin: "",
            resumeUrl: "",
            phoneNumber: "",
            education: [],
            work_experience: [],
        },
    })

    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
        control: form.control,
        name: "education",
    })

    const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
        control: form.control,
        name: "work_experience",
    })

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
        if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return
        e.preventDefault()
        
        const skill = skillInput.trim()
        if (skill && !form.getValues('skills').includes(skill)) {
            const currentSkills = form.getValues('skills')
            form.setValue('skills', [...currentSkills, skill])
            setSkillInput("")
        }
    }

    const removeSkill = (skillToRemove: string) => {
        const currentSkills = form.getValues('skills')
        form.setValue('skills', currentSkills.filter(s => s !== skillToRemove))
    }

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
                    form.setValue('skills', candidateData.skills || [])
                    form.setValue('linkedin', candidateData.linkedin_url || "")
                    form.setValue('resumeUrl', candidateData.resume_url || "")
                    form.setValue('phoneNumber', candidateData.phone_number || "")
                    // Need to cast or handle if DB structure doesn't match yet, assume it does or will be ignored
                    if (candidateData.education) form.setValue('education', candidateData.education)
                    if (candidateData.work_experience) form.setValue('work_experience', candidateData.work_experience)
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
            const { error } = await supabase
                .from('candidate_profiles')
                .upsert({
                    id: user.id,
                    bio: data.bio,
                    location: data.location,
                    skills: data.skills,
                    linkedin_url: data.linkedin || null,
                    resume_url: data.resumeUrl || null,
                    phone_number: data.phoneNumber || null,
                    education: data.education,
                    work_experience: data.work_experience,
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
                <div className="space-y-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Professional Details</h4>
                    
                    <div className="space-y-3">
                        <FormLabel>Skills</FormLabel>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Add a skill (e.g. React, Project Management)" 
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleAddSkill}
                            />
                            <Button type="button" onClick={handleAddSkill} size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md bg-muted/20">
                            {form.watch('skills').length === 0 && (
                                <p className="text-sm text-muted-foreground italic p-1">No skills added yet.</p>
                            )}
                            {form.watch('skills').map((skill) => (
                                <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1 gap-1 text-sm">
                                    {skill}
                                    <button 
                                        type="button" 
                                        onClick={() => removeSkill(skill)}
                                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Press Enter to add a skill.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> Education
                            </h4>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ school: "", degree: "", field_of_study: "", start_date: "", current: false })}>
                                <Plus className="h-4 w-4 mr-2" /> Add Education
                            </Button>
                        </div>
                        
                        {eduFields.length === 0 && (
                            <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4 text-center">
                                No education history added.
                            </div>
                        )}

                        {eduFields.map((field, index) => (
                            <div key={field.id} className="grid gap-4 p-4 border rounded-lg relative bg-card">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeEdu(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.school`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>School / University</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="University of Zambia" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.degree`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Degree</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Bachelor's" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`education.${index}.field_of_study`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field of Study</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Computer Science" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.start_date`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Year</FormLabel>
                                                <FormControl>
                                                    <Input type="month" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.end_date`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Year</FormLabel>
                                                <FormControl>
                                                    <Input type="month" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Work Experience
                            </h4>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendWork({ company: "", position: "", start_date: "", current: false })}>
                                <Plus className="h-4 w-4 mr-2" /> Add Experience
                            </Button>
                        </div>

                        {workFields.length === 0 && (
                            <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4 text-center">
                                No work experience added.
                            </div>
                        )}

                        {workFields.map((field, index) => (
                            <div key={field.id} className="grid gap-4 p-4 border rounded-lg relative bg-card">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeWork(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`work_experience.${index}.company`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tech Corp Ltd" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`work_experience.${index}.position`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Position</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Software Engineer" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`work_experience.${index}.start_date`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="month" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`work_experience.${index}.end_date`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input type="month" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`work_experience.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe your responsibilities and achievements..." className="min-h-[80px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </div>

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
