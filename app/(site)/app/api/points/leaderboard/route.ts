import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'results', 'latest.json')
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(null)
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json(null)
  }
}