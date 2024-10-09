import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const SAYINGS_KEY = 'sayings'
const API_KEY = process.env.API_KEY

interface Saying {
  date: string;
  content: string;
  tags: string[];
}

async function getSayingsForDebug(): Promise<Saying[]> {
  try {
    let sayings = await kv.get<Saying[]>(SAYINGS_KEY)
  
    // 如果 KV 中没有数据，则返回空数组
    if (!sayings) {
      sayings = []
    }

    return sayings || []
  } catch (error) {
    console.error('Error getting sayings:', error)
    return []
  }
}
  
async function getUpdateTimeForDebug(): Promise<string> {
  try {
    const updateTime = await kv.get<string>('updateTime')
    return updateTime || ''
  } catch (error) {
    console.error('Error getting updateTime:', error)
    return ''
  }
}
    

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (key === API_KEY) {  
    const sayings = await getSayingsForDebug()
    const updateTime = await getUpdateTimeForDebug()
    return NextResponse.json({ sayings, updateTime })
    } else {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
}