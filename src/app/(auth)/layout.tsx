export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Talent Hub</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Zambia's Premier Recruitment Platform
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
