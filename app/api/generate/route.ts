import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { verifyToken } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const AUTH_SECRET = process.env.AUTH_SECRET || 'your-secret-key'
const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'sayings.json')

async function updateJsonFile(sayings: any[]) {
  await fs.writeFile(JSON_FILE_PATH, JSON.stringify(sayings, null, 2), 'utf-8')
}

async function readJsonFile() {
  try {
    const data = await fs.readFile(JSON_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export async function POST(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1]
  if (!verifyToken(token)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const saying = await req.json()

  try {
    saying.tags = Array.isArray(saying.tags) ? saying.tags : []
    // 转换为北京时间
    const date = new Date(saying.date)
    const beijingTime = new Date(date.getTime() + (8 * 60 * 60 * 1000))
    saying.date = beijingTime.toISOString().replace('T', ' ').substring(0, 19)

    let existingSayings = await kv.get<any[]>('sayings') || []
    existingSayings.push(saying)
    await kv.set('sayings', existingSayings)

    // 更新 JSON 文件
    await updateJsonFile(existingSayings)

    return NextResponse.json(existingSayings)
  } catch (error) {
    return NextResponse.json({ error: '保存说说失败' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1]
  if (!verifyToken(token)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const kvSayings = await kv.get<any[]>('sayings') || []
    const jsonSayings = await readJsonFile()

    // 确保 KV 存储和 JSON 文件同步
    if (JSON.stringify(kvSayings) !== JSON.stringify(jsonSayings)) {
      await kv.set('sayings', jsonSayings)
      await updateJsonFile(jsonSayings)
    }

    return NextResponse.json(jsonSayings)
  } catch (error) {
    return NextResponse.json({ error: '获取说说失败' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1]
  if (!verifyToken(token)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { index } = await req.json()

  try {
    let existingSayings = await kv.get<any[]>('sayings') || []
    if (index === -1) {
      existingSayings = []
    } else if (index >= 0 && index < existingSayings.length) {
      existingSayings.splice(index, 1)
    } else {
      throw new Error('无效的索引')
    }
    await kv.set('sayings', existingSayings)

    // 更新 JSON 文件
    await updateJsonFile(existingSayings)

    return NextResponse.json(existingSayings)
  } catch (error) {
    return NextResponse.json({ error: '删除说说失败' }, { status: 500 })
  }
}