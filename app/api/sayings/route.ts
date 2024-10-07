import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const API_KEY = process.env.API_KEY || 'your-default-api-key'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

  console.log('Received API Key:', key)
  console.log('Expected API Key:', API_KEY)

  if (key !== API_KEY) {
    console.log('API Key mismatch')
    return NextResponse.json({ error: '未授权访问' }, { status: 401 })
  }

  try {
    const sayings = await kv.get<any[]>('sayings') || []
    return NextResponse.json(sayings)
  } catch (error) {
    console.error('Error fetching sayings:', error)
    return NextResponse.json({ error: '获取说说失败' }, { status: 500 })
  }
}