import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const random = Math.random().toString(36).substring(2, 10)
    const filename = `${Date.now()}-${random}-${file.name.replace(/\s+/g, '-')}`
    const path = join(process.cwd(), 'public', 'uploads', filename)
    await writeFile(path, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
