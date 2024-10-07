import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const AUTH_SECRET = process.env.AUTH_SECRET
const API_KEY = process.env.API_KEY
const VALID_USERNAME = process.env.VALID_USERNAME
const VALID_PASSWORD = process.env.VALID_PASSWORD

// 解析请求体并返回 JSON 对象
async function parseRequestBody(req: Request): Promise<any> {
  try {
    const body = await req.json()
    return body
  } catch (error) {
    console.error('Error parsing request body:', error)
    throw new Error('Invalid request body')
  }
}

export async function POST(req: Request) {
  try {
    const body = await parseRequestBody(req)
    const { username, password } = body

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const token = jwt.sign({ username }, AUTH_SECRET!, { expiresIn: '1h' })
      return NextResponse.json({ token, apiKey: API_KEY! })
    } else {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: '请求处理失败' }, { status: 400 })
  }
}