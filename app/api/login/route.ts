import { NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'

const VALID_USERNAME = process.env.VALID_USERNAME || 'admin'
const VALID_PASSWORD = process.env.VALID_PASSWORD || 'password'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const token = generateToken(username)
    return NextResponse.json({ token })
  } else {
    return NextResponse.json({ error: '无效的用户名或密码' }, { status: 401 })
  }
}