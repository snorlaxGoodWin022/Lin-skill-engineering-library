// store/skillStore.ts
import { create } from 'zustand'
import type { Skill } from '@/types/skill'

interface SkillState {
  // 当前选中的 Skill
  selectedSkill: Skill | null
  setSelectedSkill: (skill: Skill | null) => void

  // 筛选条件
  framework: string
  category: string
  searchQuery: string
  setFramework: (framework: string) => void
  setCategory: (category: string) => void
  setSearchQuery: (query: string) => void

  // 编辑器状态
  editorContent: string
  setEditorContent: (content: string) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void

  // 侧边栏
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useSkillStore = create<SkillState>((set) => ({
  selectedSkill: null,
  setSelectedSkill: (skill) =>
    set({
      selectedSkill: skill,
      editorContent: skill?.content || '',
      isEditing: false,
    }),

  framework: 'all',
  category: 'all',
  searchQuery: '',
  setFramework: (framework) => set({ framework }),
  setCategory: (category) => set({ category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  editorContent: '',
  setEditorContent: (editorContent) => set({ editorContent }),
  isEditing: false,
  setIsEditing: (isEditing) => set({ isEditing }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
