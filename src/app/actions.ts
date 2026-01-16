'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { z } from 'zod'

const signupSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
})

export async function signupAction(data: z.infer<typeof signupSchema>) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
        return { error: "Server configuration error: Missing service role key" }
    }

    // 1. Admin Client to create user with auto-confirm
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const email = data.email.trim()

    try {
        // Create user with email_confirm: true to bypass verification
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                full_name: data.fullName,
                role: data.role
            }
        })

        if (createError) {
            console.error("Admin createUser error:", createError)
            return { error: createError.message }
        }

        if (!userData.user) {
            return { error: "Failed to create user" }
        }
        
        console.log("User created successfully with ID:", userData.user.id)

        // 2. Standard Client to sign in (set cookies)
        const supabase = await createServerClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: data.password
        })

        if (signInError) {
            console.error("SignIn after creation error:", signInError)
            return { error: "Account created but failed to sign in. Please log in manually." }
        }

        // 3. Ensure extended profile exists (just in case trigger failed, though trigger logic was fixed)
        // We can do this via Admin client to be safe and fast
        if (data.role === 'RECRUITER') {
            const { error: profileError } = await supabaseAdmin
                .from('recruiter_profiles')
                .upsert({
                    id: userData.user.id,
                    company_name: data.fullName,
                    is_approved: false
                })
            
            if (profileError) console.error("Recruiter profile creation error:", profileError)

        } else {
            const { error: profileError } = await supabaseAdmin
                .from('candidate_profiles')
                .upsert({
                    id: userData.user.id,
                    skills: []
                })

            if (profileError) console.error("Candidate profile creation error:", profileError)
        }

        return { success: true }

    } catch (err: any) {
        console.error("Unexpected error in signupAction:", err)
        return { error: err.message || "An unexpected error occurred" }
    }
}
