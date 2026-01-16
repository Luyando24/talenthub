import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Search, Briefcase, Users, Star, Globe, MapPin } from "lucide-react"
import { JobCard } from "@/components/jobs/job-card"
import { Job } from "@/types"

import { createClient } from "@/utils/supabase/server"

export default async function Home() {
    const supabase = await createClient()

    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10)

    // Manual join to get recruiter profiles
    let jobsWithRecruiters: any[] = []
    
    if (jobs && jobs.length > 0) {
        const recruiterIds = Array.from(new Set(jobs.map(j => j.recruiter_id)))
        const { data: recruiters } = await supabase
            .from("recruiter_profiles")
            .select("id, company_name")
            .in("id", recruiterIds)
        
        const recruiterMap = new Map(recruiters?.map(r => [r.id, r]) || [])

        jobsWithRecruiters = jobs.map(job => ({
            ...job,
            recruiter: recruiterMap.get(job.recruiter_id) || { company_name: "Unknown" }
        }))
    }

    const recentJobs = (jobsWithRecruiters || []) as (Job & { recruiter: { company_name: string } })[]

    return (
        <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
            {/* Hero Section */}
            <section className="relative w-full py-20 md:py-32 lg:py-40 flex items-center justify-center overflow-hidden bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20 dark:to-background">
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#042f2e_100%)] opacity-20"></div>
                <div className="container px-4 md:px-6 relative z-10">
                    <div className="flex flex-col items-center space-y-8 text-center">
                        <div className="space-y-4 max-w-4xl">
                            <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2 animate-pulse"></span>
                                #1 Recruitment Platform in Zambia
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-green-900 to-green-600 dark:from-green-100 dark:to-green-400 drop-shadow-sm pb-2">
                                Find Your Dream Job
                            </h1>

                            <form action="/jobs" className="mx-auto w-full max-w-4xl mt-8 p-3 rounded-xl border bg-background/50 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        name="query"
                                        placeholder="Job title or keyword"
                                        className="w-full h-12 rounded-lg border border-input bg-background/80 px-3 pl-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all hover:bg-background"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        name="location"
                                        placeholder="City or Province"
                                        className="w-full h-12 rounded-lg border border-input bg-background/80 px-3 pl-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all hover:bg-background"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        name="industry"
                                        placeholder="Industry"
                                        className="w-full h-12 rounded-lg border border-input bg-background/80 px-3 pl-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all hover:bg-background"
                                    />
                                </div>
                                <Button type="submit" size="lg" className="h-12 px-8 shadow-md">
                                    Search
                                </Button>
                            </form>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 min-w-[300px] pt-4">
                            <Link href="/jobs" className="flex-1">
                                <Button size="lg" className="h-12 w-full text-base shadow-lg shadow-green-500/20 transition-transform hover:scale-105">
                                    Browse Jobs
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/signup?role=recruiter" className="flex-1">
                                <Button variant="outline" size="lg" className="h-12 w-full text-base border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/50 dark:hover:text-green-300">
                                    Post a Job
                                </Button>
                            </Link>
                        </div>

                        {/* Recent Jobs */}
                        <div className="w-full max-w-5xl pt-16 text-left">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Recent Opportunities</h2>
                                <Link href="/jobs" className="text-sm font-medium text-primary hover:underline flex items-center">
                                    View all jobs <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                            <div className="grid gap-4 grid-cols-1">
                                {recentJobs.length > 0 ? (
                                    recentJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                                        <p className="text-muted-foreground">No recent jobs found. Be the first to post!</p>
                                        <Link href="/signup?role=recruiter" className="mt-4 inline-block">
                                            <Button variant="outline">Post a Job</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center mt-8">
                                <Link href="/jobs">
                                    <Button variant="outline" size="lg" className="px-8 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30">
                                        View all jobs
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section (Mock) */}
            <section className="w-full py-12 border-y bg-muted/30">
                <div className="container px-4 md:px-6 text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Trusted by leading companies in Lusaka</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos */}
                        <div className="flex items-center gap-2 font-bold text-xl"><Briefcase className="h-6 w-6" /> TechZambia</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Globe className="h-6 w-6" /> Lusaka Logistics</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Briefcase className="h-6 w-6" /> CopperBelt Mining</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Users className="h-6 w-6" /> FinServe</div>
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="w-full py-20 md:py-32 bg-background">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">Why Choose Talent Hub?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">We've reimagined the recruitment process to clear the path between talent and opportunity.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-green-200 dark:hover:border-green-800">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-500/10 blur-2xl transition-all group-hover:bg-green-500/20"></div>
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Smart "Easy Apply"</h3>
                            <p className="text-muted-foreground">
                                No more filling out the same forms. Create your profile once, upload your CV, and apply to any job with a single click.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-green-200 dark:hover:border-green-800">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20"></div>
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Verified Jobs</h3>
                            <p className="text-muted-foreground">
                                Every job posting is verified to ensure legitimacy. We filter out scams so you can focus on building your career.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-green-200 dark:hover:border-green-800">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20"></div>
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                <Star className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Career Growth</h3>
                            <p className="text-muted-foreground">
                                Get matched with roles that fit your skills and career goals. Receive recommendations based on your profile.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Role CTA Section */}
            <section className="w-full py-20 bg-muted/50 dark:bg-muted/10">
                <div className="container px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Candidate CTA */}
                        <div className="flex flex-col justify-center space-y-4 p-8 rounded-3xl bg-background border shadow-sm relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -z-10"></div>
                            <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold w-fit">For Candidates</div>
                            <h3 className="text-3xl font-bold">Ready to start your journey?</h3>
                            <p className="text-muted-foreground">Join thousands of professionals finding meaningful work in Zambia.</p>
                            <Link href="/signup">
                                <Button className="w-fit" size="lg">Create Free Profile</Button>
                            </Link>
                        </div>

                        {/* Recruiter CTA */}
                        <div className="flex flex-col justify-center space-y-4 p-8 rounded-3xl bg-zinc-900 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -z-10"></div>
                            <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold w-fit">For Employers</div>
                            <h3 className="text-3xl font-bold">Hire the best talent.</h3>
                            <p className="text-zinc-400">Post jobs, screen applicants, and hire faster with our purpose-built dashboard.</p>
                            <Link href="/signup?role=recruiter">
                                <Button variant="secondary" className="w-fit" size="lg">Post a Job</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
