import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t pt-16 pb-8">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="font-bold text-xl">Talent Hub</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Connecting Zambia's top talent with leading employers.
                            We are dedicated to modernizing recruitment in Africa.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-green-600 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className="font-semibold mb-4">For Candidates</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link></li>
                            <li><Link href="/signup" className="hover:text-foreground transition-colors">Create Profile</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Job Alerts</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Career Advice</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">For Employers</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/signup?role=recruiter" className="hover:text-foreground transition-colors">Post a Job</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Browse Candidates</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Pricing Plans</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Recruiter Login</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter / Contact */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground">Get the latest job opportunities and career tips.</p>
                        <div className="flex gap-2">
                            <Input placeholder="Enter your email" className="bg-background" />
                            <Button size="icon" className="shrink-0 bg-green-600 hover:bg-green-700">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© 2026 Talent Hub Zambia. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
