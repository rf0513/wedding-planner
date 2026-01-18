import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file type (include HEIC/HEIF for iPhone)
        const validTypes = ['image/', 'application/octet-stream']
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
        const hasValidType = validTypes.some(t => file.type.startsWith(t)) || file.type === ''
        const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

        if (!hasValidType && !hasValidExt) {
            return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
        }

        // Validate file size (10MB for high-res phone photos)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)` }, { status: 400 })
        }

        // Upload to Vercel Blob
        const blob = await put(`vision-board/${file.name}`, file, {
            access: 'public',
        })

        return NextResponse.json({ url: blob.url })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
