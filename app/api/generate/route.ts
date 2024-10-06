import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(req: Request) {
  const saying = await req.json()

  try {
    saying.tags = Array.isArray(saying.tags) ? saying.tags : []
    let existingSayings = await kv.get<any[]>('sayings') || []
    existingSayings.push(saying)
    await kv.set('sayings', existingSayings)
    return NextResponse.json(existingSayings)
  } catch (error) {
    return NextResponse.json({ error: '保存说说失败' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sayings = await kv.get<any[]>('sayings') || []
    return NextResponse.json(sayings)
  } catch (error) {
    return NextResponse.json({ error: '获取说说失败' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { index } = await req.json()

  try {
    let existingSayings = await kv.get<any[]>('sayings') || []
    if (index === -1) {
      // 删除所有内容
      existingSayings = []
    } else if (index >= 0 && index < existingSayings.length) {
      // 删除特定索引的内容
      existingSayings.splice(index, 1)
    } else {
      throw new Error('无效的索引')
    }
    await kv.set('sayings', existingSayings)
    return NextResponse.json(existingSayings)
  } catch (error) {
    return NextResponse.json({ error: '删除说说失败' }, { status: 500 })
  }
}