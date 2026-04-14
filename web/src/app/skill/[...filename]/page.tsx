// app/skill/[...filename]/page.tsx
import { getSkill } from '@/lib/skill-loader'
import SkillDetailClient from './SkillDetailClient'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ filename: string[] }>
}

export default async function SkillDetailPage({ params }: Props) {
  const { filename } = await params
  const filepath = filename.join('/')
  const skill = getSkill(filepath)

  if (!skill) {
    notFound()
  }

  return <SkillDetailClient skill={skill} />
}
