import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fileName, fileType, fileSize } = await request.json()

  const MAX_SIZE = 500 * 1024 * 1024
  if (fileSize > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 400 })
  }

  const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/webm']
  if (!allowedTypes.includes(fileType)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  try {
    const key = `videos/${clerkId}/${Date.now()}-${fileName.replace(/[^a-z0-9.-]/gi, '_')}`
    const uploadUrl = `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET}/${key}`
    const publicUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/${key}`

    return NextResponse.json({ uploadUrl, publicUrl, key })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
