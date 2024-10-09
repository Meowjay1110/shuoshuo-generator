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
  // First, try to get data from Vercel KV
  let sayings = await kv.get<Saying[]>(SAYINGS_KEY)
  
  // If there's no data in KV, read from the file
  if (!sayings) {
    const filePath = path.join(process.cwd(), 'sayings.json')
    try {
      const data = await fs.readFile(filePath, 'utf8')
      sayings = JSON.parse(data) as Saying[]
      // Store the data in KV for future quick access
      await kv.set(SAYINGS_KEY, sayings)
    } catch (error) {
      console.error('Error reading sayings file:', error)
      sayings = []
    }
  }
  
  return sayings
}

async function saveSayings(sayings: Saying[]): Promise<void> {
  // Save to Vercel KV
  await kv.set(SAYINGS_KEY, sayings)
  
  // Also save to the file system for compatibility
  const filePath = path.join(process.cwd(), 'sayings.json')
  await fs.writeFile(filePath, JSON.stringify(sayings, null, 2))
}

export async function GET() {
  const sayings = await getSayings()
  return NextResponse.json(sayings)
}

export async function POST(request: Request) {
  const newSaying = await request.json() as Saying
  const sayings = await getSayings()
  sayings.unshift(newSaying)
  await saveSayings(sayings)
  return NextResponse.json(sayings)
}

export async function DELETE(request: Request) {
  const { index } = await request.json() as { index: number }
  const sayings = await getSayings()
  if (index === -1) {
    await saveSayings([])
  } else {
    sayings.splice(index, 1)
    await saveSayings(sayings)
  }
  return NextResponse.json(sayings)
}