import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Globe2, Users2, Zap } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="container px-4 md:px-6 pt-6">
                <Breadcrumbs />
            </div>
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
                            <Link href="/signup?role=recruiter&intent=post_job">
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

            {/* Our Story Section */}
            <section className="w-full py-16 md:py-24 bg-background">
                <div className="container max-w-6xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">
                        <div className="md:w-1/2 space-y-6 text-center md:text-left">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">Our Story</h2>
                            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                                <p>
                                    Our journey began in 2019 with a simple yet powerful vision: to bridge the gap between talent and opportunity in an ever-changing professional landscape.
                                </p>
                                <p>
                                    We're not your average HR company. We're a team of passionate Zambians shaking things up with a fresh, tech-powered approach to human capital solutions. We believe HR should be streamlined, cost-effective, and get you results.
                                </p>
                                <p>
                                    Whether you're a job seeker looking for your perfect fit or a company seeking top talent, we've got you covered. We offer a wide range of HR solutions designed to empower individuals and propel businesses forward.
                                </p>
                            </div>
                        </div>
                        <div className="md:w-1/2 flex justify-center w-full">
                            <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-green-100 to-green-50 rounded-3xl overflow-hidden flex items-center justify-center p-8 shadow-xl rotate-3 transition-transform hover:rotate-0 duration-500">
                                <div className="text-center space-y-3">
                                    <div className="text-6xl font-extrabold text-green-700">2019</div>
                                    <div className="text-lg font-semibold text-green-600 uppercase tracking-widest">Established</div>
                                    <div className="w-24 h-1.5 bg-green-500 mx-auto my-6 rounded-full"></div>
                                    <p className="text-green-800 italic text-xl">"Redefining HR in Zambia"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="w-full py-16 md:py-24 bg-muted/30">
                <div className="container max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <div className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-800">
                            Our Culture
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Our Core Values</h2>
                        <p className="text-muted-foreground text-xl">
                            The principles that guide everything we do. We call it <span className="font-bold text-primary">ARISE</span>.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4 h-full">
                                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-inner mb-2">A</div>
                                <h3 className="text-xl font-bold">Accountability</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We are accountable and take responsibility for what we do.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4 h-full">
                                <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl shadow-inner mb-2">R</div>
                                <h3 className="text-xl font-bold">Respect</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We respect diversity and recognize the worth and dignity of every individual.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4 h-full">
                                <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl shadow-inner mb-2">I</div>
                                <h3 className="text-xl font-bold">Integrity</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We behave ethically, fairly and act openly in all our dealings.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300 lg:col-start-1 lg:ml-auto"> {/* Offset for centering */}
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4 h-full">
                                <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 font-bold text-2xl shadow-inner mb-2">S</div>
                                <h3 className="text-xl font-bold">Stewardship</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We take pride in managing what has been entrusted to us.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300 lg:mr-auto"> {/* Offset for centering */}
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4 h-full">
                                <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 font-bold text-2xl shadow-inner mb-2">E</div>
                                <h3 className="text-xl font-bold">Excellence</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We strive to achieve excellence in all we do.
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
