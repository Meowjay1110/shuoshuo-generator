import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1]
  if (!verifyToken(token)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const sayings = await kv.get<any[]>('sayings') || []
    return NextResponse.json(sayings)
  } catch (error) {
    return NextResponse.json({ error: '获取说说失败' }, { status: 500 })
  }
}