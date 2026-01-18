import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
        }

        // Validate file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure uploads directory exists - use path.resolve for reliable Windows path handling
        const uploadDir = path.resolve('./public/uploads/vision-board')
        console.log('Upload dir:', uploadDir)

        try {
            await mkdir(uploadDir, { recursive: true })
            console.log('Upload directory created/verified:', uploadDir)
        } catch (mkdirError) {
            console.error('Failed to create upload directory:', mkdirError)
            return NextResponse.json({
                error: 'Failed to create upload directory',
                details: mkdirError instanceof Error ? mkdirError.message : 'Unknown error'
            }, { status: 500 })
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.name) || '.jpg'
        const filename = `vision-${uniqueSuffix}${ext}`
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // Return public URL
        const publicUrl = `/uploads/vision-board/${filename}`

        return NextResponse.json({ url: publicUrl })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
