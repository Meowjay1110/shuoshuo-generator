import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'
const API_KEY = process.env.API_KEY || 'your-default-api-key'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  // 这里应该有真实的用户验证逻辑
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })
    return NextResponse.json({ token, apiKey: API_KEY })
  } else {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }
}