import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(req: Request) {
  const saying = await req.json()

  try {
    // Ensure tags is always an array
    saying.tags = Array.isArray(saying.tags) ? saying.tags : []

    // Get existing sayings
    let existingSayings = await kv.get<any[]>('sayings') || []

    // Add new saying
    existingSayings.push(saying)

    // Save updated sayings
    await kv.set('sayings', existingSayings)

    return NextResponse.json(existingSayings)
  } catch (error) {
    return NextResponse.json({ error: '保存说说失败' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sayings = await kv.get<any[]>('sayings') || []
    return NextResponse.json(sayings)
  } catch (error) {
    return NextResponse.json({ error: '获取说说失败' }, { status: 500 })
  }
}