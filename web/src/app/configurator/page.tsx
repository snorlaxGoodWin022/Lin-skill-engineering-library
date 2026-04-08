// app/configurator/page.tsx
import { Suspense } from 'react'
import ConfiguratorContent from './ConfiguratorContent'

export default function ConfiguratorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">加载中...</div>}>
      <ConfiguratorContent />
    </Suspense>
  )
}
