import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
        return NextResponse.json({ results: [] })
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=squarish`, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        })

        if (!res.ok) {
            throw new Error(`Unsplash API responded with ${res.status}`)
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Unsplash Search Error:', error)
        return NextResponse.json({ error: 'Failed to fetch from Unsplash' }, { status: 500 })
    }
}
