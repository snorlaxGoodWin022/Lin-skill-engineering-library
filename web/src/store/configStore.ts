// store/configStore.ts
import { create } from 'zustand'

interface ConfigState {
  selectedSkillFilename: string | null
  markdownContent: string
  searchQuery: string
  frameworkFilter: string

  setSelectedSkillFilename: (filename: string | null) => void
  setMarkdownContent: (content: string) => void
  setSearchQuery: (query: string) => void
  setFrameworkFilter: (framework: string) => void
  resetConfig: () => void
}

const initialState = {
  selectedSkillFilename: null as string | null,
  markdownContent: '',
  searchQuery: '',
  frameworkFilter: 'all',
}

export const useConfigStore = create<ConfigState>((set) => ({
  ...initialState,

  setSelectedSkillFilename: (filename) => set({ selectedSkillFilename: filename }),
  setMarkdownContent: (content) => set({ markdownContent: content }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFrameworkFilter: (framework) => set({ frameworkFilter: framework }),
  resetConfig: () => set(initialState),
}))
