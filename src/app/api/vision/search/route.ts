import { NextRequest, NextResponse } from 'next/server'

interface SearchResult {
    id: string
    url: string
    thumbnail: string
    source: 'unsplash' | 'pexels' | 'google'
    title?: string
    author?: string
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const source = searchParams.get('source') || 'unsplash'

    if (!query) {
        return NextResponse.json({ results: [] })
    }

    try {
        let results: SearchResult[] = []

        switch (source) {
            case 'unsplash':
                results = await searchUnsplash(query)
                break
            case 'pexels':
                results = await searchPexels(query)
                break
            case 'google':
                results = await searchGoogle(query)
                break
            default:
                return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
        }

        return NextResponse.json({ results })
    } catch (error) {
        console.error(`Search Error (${source}):`, error)
        return NextResponse.json({ error: `Failed to fetch from ${source}` }, { status: 500 })
    }
}

async function searchUnsplash(query: string): Promise<SearchResult[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) throw new Error('Unsplash key missing')

    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=squarish`, {
        headers: { 'Authorization': `Client-ID ${accessKey}` }
    })

    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`)

    const data = await res.json()
    return data.results.map((item: any) => ({
        id: item.id,
        url: item.urls.regular,
        thumbnail: item.urls.thumb,
        source: 'unsplash',
        title: item.alt_description,
        author: item.user.name
    }))
}

async function searchPexels(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.PEXELS_API_KEY
    if (!apiKey) throw new Error('Pexels key missing')

    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12`, {
        headers: { 'Authorization': apiKey }
    })

    if (!res.ok) throw new Error(`Pexels API error: ${res.status}`)

    const data = await res.json()
    return data.photos.map((item: any) => ({
        id: String(item.id),
        url: item.src.large,
        thumbnail: item.src.medium,
        source: 'pexels',
        title: item.alt,
        author: item.photographer
    }))
}

async function searchGoogle(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.GOOGLE_API_KEY
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID
    if (!apiKey || !cx) throw new Error('Google keys missing')

    const res = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${cx}&key=${apiKey}&searchType=image&num=10`)

    if (!res.ok) throw new Error(`Google API error: ${res.status}`)

    const data = await res.json()
    return (data.items || []).map((item: any, index: number) => ({
        id: `google-${index}`,
        url: item.link,
        thumbnail: item.image.thumbnailLink,
        source: 'google',
        title: item.title,
        author: item.displayLink
    }))
}
