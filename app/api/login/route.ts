import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'
const API_KEY = process.env.API_KEY || 'your-default-api-key'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })
    return NextResponse.json({ token, apiKey: API_KEY })
  } else {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }
}