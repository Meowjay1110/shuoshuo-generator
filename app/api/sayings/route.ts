import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const ACCESS_KEY = process.env.ACCESS_KEY || 'default_access_key'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const accessKey = searchParams.get('access_key')

  if (accessKey !== ACCESS_KEY) {
    return NextResponse.json({ error: '访问被拒绝' }, { status: 403 })
  }

  try {
    const sayings = await kv.get<any[]>('sayings') || []
    return NextResponse.json(sayings)
  } catch (error) {
    console.error('Error fetching sayings:', error)
    return NextResponse.json({ error: '获取说说失败' }, { status: 500 })
  }
}