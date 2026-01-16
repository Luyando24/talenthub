export function stripHtml(html: string): string {
    if (!html) return ""
    // Basic regex strip for client/server shared usage where DOMParser might not be available
    // For a more robust solution on client-side, we can use browser APIs, but regex is fast for previews
    return html.replace(/<[^>]*>?/gm, '')
}
