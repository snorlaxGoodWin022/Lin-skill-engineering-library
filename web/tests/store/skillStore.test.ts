import { describe, it, expect, beforeEach } from 'vitest'
import { useSkillStore } from '@/store/skillStore'
import type { Skill } from '@/types/skill'

const initialState = {
  selectedSkill: null,
  framework: 'all',
  category: 'all',
  searchQuery: '',
  editorContent: '',
  isEditing: false,
  sidebarCollapsed: false,
}

const mockSkill: Skill = {
  filename: 'form-generator-react.skill.md',
  content: '# Skill: 表单生成器\n\n## 使用场景\n\n测试内容',
  meta: {
    title: '表单生成器',
    description: '生成表单组件',
    framework: 'react',
    category: 'form',
  },
}

describe('skillStore', () => {
  beforeEach(() => {
    // 使用 merge 模式重置数据属性（不替换 action 函数）
    useSkillStore.setState(initialState)
  })

  it('初始状态正确', () => {
    const state = useSkillStore.getState()
    expect(state.selectedSkill).toBeNull()
    expect(state.framework).toBe('all')
    expect(state.category).toBe('all')
    expect(state.searchQuery).toBe('')
    expect(state.editorContent).toBe('')
    expect(state.isEditing).toBe(false)
    expect(state.sidebarCollapsed).toBe(false)
  })

  it('setSelectedSkill 更新 editorContent 和 isEditing', () => {
    useSkillStore.getState().setSelectedSkill(mockSkill)
    const state = useSkillStore.getState()
    expect(state.selectedSkill).toEqual(mockSkill)
    expect(state.editorContent).toBe(mockSkill.content)
    expect(state.isEditing).toBe(false)
  })

  it('setSelectedSkill(null) 清除选择和内容', () => {
    useSkillStore.getState().setSelectedSkill(mockSkill)
    useSkillStore.getState().setSelectedSkill(null)
    const state = useSkillStore.getState()
    expect(state.selectedSkill).toBeNull()
    expect(state.editorContent).toBe('')
  })

  it('setFramework 更新框架筛选', () => {
    useSkillStore.getState().setFramework('react')
    expect(useSkillStore.getState().framework).toBe('react')
  })

  it('setCategory 更新分类筛选', () => {
    useSkillStore.getState().setCategory('form')
    expect(useSkillStore.getState().category).toBe('form')
  })

  it('setSearchQuery 更新搜索关键词', () => {
    useSkillStore.getState().setSearchQuery('表单')
    expect(useSkillStore.getState().searchQuery).toBe('表单')
  })

  it('setEditorContent 更新编辑器内容', () => {
    useSkillStore.getState().setEditorContent('new content')
    expect(useSkillStore.getState().editorContent).toBe('new content')
  })

  it('setIsEditing 更新编辑状态', () => {
    useSkillStore.getState().setIsEditing(true)
    expect(useSkillStore.getState().isEditing).toBe(true)
  })

  it('toggleSidebar 切换侧边栏状态', () => {
    expect(useSkillStore.getState().sidebarCollapsed).toBe(false)
    useSkillStore.getState().toggleSidebar()
    expect(useSkillStore.getState().sidebarCollapsed).toBe(true)
    useSkillStore.getState().toggleSidebar()
    expect(useSkillStore.getState().sidebarCollapsed).toBe(false)
  })
})
