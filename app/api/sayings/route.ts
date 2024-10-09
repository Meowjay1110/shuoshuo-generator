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
    
    if (!sayings) {
      sayings = [] as Saying[]
      await kv.set(SAYINGS_KEY, sayings)
    }

    return sayings || []
  } catch (error) {
    console.error('Error getting sayings:', error)
    return []
  }
}
export async function GET() {
  const sayings = await getSayings()
  return NextResponse.json(sayings)
}