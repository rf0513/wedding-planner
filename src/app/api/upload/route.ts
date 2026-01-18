import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // Validate it's an image path
                if (!pathname.startsWith('vision-board/')) {
                    throw new Error('Invalid upload path')
                }
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
                    maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
                }
            },
            onUploadCompleted: async ({ blob }) => {
                console.log('Upload completed:', blob.url)
            },
        })

        return NextResponse.json(jsonResponse)
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 400 }
        )
    }
}
