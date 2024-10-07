import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const AUTH_SECRET = process.env.AUTH_SECRET || 'your-jwt-secret'
const API_KEY = process.env.API_KEY || 'your-default-api-key'
const VALID_USERNAME = process.env.VALID_USERNAME || 'admin'
const VALID_PASSWORD = process.env.VALID_PASSWORD || 'password'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const token = jwt.sign({ username }, AUTH_SECRET, { expiresIn: '1h' })
    return NextResponse.json({ token, apiKey: API_KEY })
  } else {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }
}