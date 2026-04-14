// app/api/skills/[filename]/route.ts
import { NextResponse } from 'next/server'
import { getSkill } from '@/lib/skill-loader'

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  const skill = getSkill(filename)

  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  return NextResponse.json({ skill })
}
