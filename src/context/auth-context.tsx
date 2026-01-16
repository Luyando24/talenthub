'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    isLoading: true,
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser(user)
                // Fetch profile
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profileData) {
                    setProfile(profileData as Profile)
                }
            } else {
                setUser(null)
                setProfile(null)
            }
            setIsLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user)
                    // Fetch profile on login
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single()
                        if (profileData) setProfile(profileData as Profile)
                    }
                } else {
                    setUser(null)
                    setProfile(null)
                }
                setIsLoading(false)
                router.refresh()
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
