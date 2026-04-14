// app/api/skills/[...filename]/route.ts
import { NextResponse } from 'next/server'
import { getSkill } from '@/lib/skill-loader'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  const { filename } = await params
  const filepath = filename.join('/')
  const skill = getSkill(filepath)

  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  return NextResponse.json({ skill })
}
