// app/editor/page.tsx
'use client'

import { Suspense } from 'react'
import EditorContent from './EditorContent'

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <EditorContent />
    </Suspense>
  )
}
