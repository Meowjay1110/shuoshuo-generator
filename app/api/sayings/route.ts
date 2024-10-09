import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import fs from 'fs/promises'
import path from 'path'

const SAYINGS_KEY = 'sayings'

async function getSayings() {
  // 首先尝试从 Vercel KV 获取数据
  let sayings = await kv.get(SAYINGS_KEY)
  
  // 如果 KV 中没有数据，则从文件中读取
  if (!sayings) {
    const filePath = path.join(process.cwd(), 'sayings.json')
    try {
      const data = await fs.readFile(filePath, 'utf8')
      sayings = JSON.parse(data)
      // 将数据存入 KV 以便将来快速访问
      await kv.set(SAYINGS_KEY, sayings)
    } catch (error) {
      console.error('Error reading sayings file:', error)
      sayings = []
    }
  }
  
  return sayings
}

export async function GET() {
  const sayings = await getSayings()
  return NextResponse.json(sayings)
}