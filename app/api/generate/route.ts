import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import fs from 'fs/promises'
import path from 'path'

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
      const filePath = path.join(process.cwd(), 'sayings.json')
      const data = await fs.readFile(filePath, 'utf8')
      sayings = JSON.parse(data) as Saying[]
      await kv.set(SAYINGS_KEY, sayings)
    }
    
    return sayings || []
  } catch (error) {
    console.error('Error getting sayings:', error)
    return []
  }
}

async function saveSayings(sayings: Saying[]): Promise<void> {
  try {
    await kv.set(SAYINGS_KEY, sayings)
    
    const filePath = path.join(process.cwd(), 'sayings.json')
    await fs.writeFile(filePath, JSON.stringify(sayings, null, 2))
  } catch (error) {
    console.error('Error saving sayings:', error)
  }
}

export async function GET() {
  const sayings = await getSayings()
  return NextResponse.json(sayings)
}

export async function POST(request: Request) {
  try {
    const newSaying = await request.json() as Saying
    const sayings = await getSayings()
    sayings.unshift(newSaying)
    await saveSayings(sayings)
    return NextResponse.json(sayings)
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json({ error: 'Failed to add saying' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { index } = await request.json() as { index: number }
    const sayings = await getSayings()
    if (index === -1) {
      await saveSayings([])
    } else {
      sayings.splice(index, 1)
      await saveSayings(sayings)
    }
    return NextResponse.json(sayings)
  } catch (error) {
    console.error('Error in DELETE:', error)
    return NextResponse.json({ error: 'Failed to delete saying' }, { status: 500 })
  }
}