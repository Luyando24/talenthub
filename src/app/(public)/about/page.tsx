import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Globe2, Users2, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                Connecting Zambia&apos;s Talent
                            </h1>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Talent Hub is the premier digital recruitment platform designed specifically for the Zambian market. We bridge the gap between skilled professionals and forward-thinking companies.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/jobs">
                                <Button size="lg">Find a Job</Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="outline" size="lg">Post a Job</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                                Our Mission
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                Empowering Career Growth in Africa
                            </h2>
                            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                We believe that finding the right job should be simple, transparent, and accessible to everyone. Our platform removes the friction from traditional hiring processes.
                            </p>
                            <ul className="grid gap-2 py-4">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Simplified "One-Click" Applications</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Verified Company Profiles</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Real-time Application Tracking</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl overflow-hidden flex items-center justify-center">
                                <div className="text-9xl">🇿🇲</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="bg-background">
                            <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Fast & Efficient</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our algorithm matches you with jobs that fit your profile instantly. No more endless searching.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background">
                            <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Users2 className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">For Recruiters</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage your candidate pipeline with advanced tools. Screen, shortlist, and hire the best.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background">
                            <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Globe2 className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Local Focus</h3>
                                <p className="text-sm text-muted-foreground">
                                    Built in Lusaka, for Zambia. We understand the local market nuances and needs.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to get started?</h2>
                        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                            Join thousands of job seekers and employers in Zambia today.
                        </p>
                        <div className="space-x-4">
                            <Link href="/signup">
                                <Button size="lg">Create Account</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
