// store/configStore.ts
import { create } from 'zustand'
import type { TemplateType, FieldDefinition, ParsedSkill } from '@/types/configurator'

interface ConfigState {
  step: number
  setStep: (step: number) => void

  templateType: TemplateType | null
  setTemplateType: (type: TemplateType) => void

  framework: 'react' | 'vue3' | null
  setFramework: (fw: 'react' | 'vue3') => void

  values: Record<string, any>
  setFieldValue: (key: string, value: any) => void

  fields: FieldDefinition[]
  setFields: (fields: FieldDefinition[]) => void

  resetConfig: () => void
  importConfig: (parsed: ParsedSkill) => void
}

const initialState = {
  step: 1,
  templateType: null as TemplateType | null,
  framework: null as 'react' | 'vue3' | null,
  values: {} as Record<string, any>,
  fields: [] as FieldDefinition[],
}

export const useConfigStore = create<ConfigState>((set) => ({
  ...initialState,

  step: 1,
  setStep: (step) => set({ step }),

  templateType: null,
  setTemplateType: (templateType) => set({ templateType, step: 2, values: {}, fields: [] }),

  framework: null,
  setFramework: (framework) => set({ framework, step: 3 }),

  values: {},
  setFieldValue: (key, value) => set((state) => ({ values: { ...state.values, [key]: value } })),

  fields: [],
  setFields: (fields) => set({ fields }),

  resetConfig: () => set(initialState),

  importConfig: (parsed) => {
    const step = parsed.templateType && parsed.framework ? 3 : parsed.templateType ? 2 : 1
    set({
      step,
      templateType: parsed.templateType,
      framework: parsed.framework,
      values: parsed.values,
      fields: parsed.fields,
    })
  },
}))
