import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore } from '@/store/configStore'

describe('configStore', () => {
  beforeEach(() => {
    useConfigStore.getState().resetConfig()
  })

  it('初始状态', () => {
    const state = useConfigStore.getState()
    expect(state.selectedSkillFilename).toBeNull()
    expect(state.markdownContent).toBe('')
    expect(state.searchQuery).toBe('')
    expect(state.frameworkFilter).toBe('all')
  })

  it('setSelectedSkillFilename 更新选中技能', () => {
    useConfigStore.getState().setSelectedSkillFilename('react/form.skill.md')
    expect(useConfigStore.getState().selectedSkillFilename).toBe('react/form.skill.md')
  })

  it('setMarkdownContent 更新内容', () => {
    useConfigStore.getState().setMarkdownContent('# Hello')
    expect(useConfigStore.getState().markdownContent).toBe('# Hello')
  })

  it('setSearchQuery 更新搜索词', () => {
    useConfigStore.getState().setSearchQuery('form')
    expect(useConfigStore.getState().searchQuery).toBe('form')
  })

  it('setFrameworkFilter 更新框架筛选', () => {
    useConfigStore.getState().setFrameworkFilter('react')
    expect(useConfigStore.getState().frameworkFilter).toBe('react')
  })

  it('resetConfig 恢复初始状态', () => {
    useConfigStore.getState().setSelectedSkillFilename('test.md')
    useConfigStore.getState().setMarkdownContent('content')
    useConfigStore.getState().setSearchQuery('query')
    useConfigStore.getState().setFrameworkFilter('vue3')
    useConfigStore.getState().resetConfig()

    const state = useConfigStore.getState()
    expect(state.selectedSkillFilename).toBeNull()
    expect(state.markdownContent).toBe('')
    expect(state.searchQuery).toBe('')
    expect(state.frameworkFilter).toBe('all')
  })
})
