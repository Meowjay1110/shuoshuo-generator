import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const SAYINGS_KEY = 'sayings'

interface Saying {
  date: string;
  content: string;
  tags: string[];
}

async function getSayings(): Promise<Saying[]> {
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
  
export async function GET(req: Request) {
  const sayings = await getSayings()
  return NextResponse.json(sayings)
}