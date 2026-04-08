// app/api/skills/route.ts
import { NextResponse } from 'next/server'
import { getAllSkills } from '@/lib/skill-loader'

export async function GET() {
  const skills = getAllSkills()
  return NextResponse.json({ skills })
}
