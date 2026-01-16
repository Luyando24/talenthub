'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function SearchJobs() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [query, setQuery] = useState(searchParams.get("q") || "")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams)
        if (query) {
            params.set("q", query)
        } else {
            params.delete("q")
        }
        router.push(`/jobs?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by job title..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 bg-background shadow-sm"
                />
            </div>
            <Button type="submit" className="shadow-sm">
                Search
            </Button>
        </form>
    )
}
