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

        // Sanitize filename for Vercel Blob
        const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
        const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ext) ? ext : 'jpg'
        const safeName = `vision-board/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`

        // Convert to buffer to strip file metadata
        const buffer = await file.arrayBuffer()

        // Upload to Vercel Blob
        const blob = await put(safeName, buffer, {
            access: 'public',
            contentType: file.type || 'image/jpeg',
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
