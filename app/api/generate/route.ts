import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(req: Request) {
  const { template, data } = await req.json()

  try {
    const dataArray = JSON.parse(data)
    const newSayings = dataArray.map((item: any) => {
      let jsonStr = template
      for (const [key, value] of Object.entries(item)) {
        const regex = new RegExp(`\\$${key}`, 'g')
        jsonStr = jsonStr.replace(regex, JSON.stringify(value))
      }
      return JSON.parse(jsonStr)
    })

    // 获取现有的说说
    let existingSayings = await kv.get<any[]>('sayings') || []

    // 合并新的和现有的说说
    const allSayings = [...existingSayings, ...newSayings]

    // 保存合并后的说说
    await kv.set('sayings', allSayings)

    return NextResponse.json(allSayings)
  } catch (error) {
    return NextResponse.json({ error: '无效的 JSON 格式或保存失败' }, { status: 400 })
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