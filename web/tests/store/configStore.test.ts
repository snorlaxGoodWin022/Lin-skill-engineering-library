import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore } from '@/store/configStore'
import type { ParsedSkill } from '@/types/configurator'

const initialState = {
  step: 1,
  templateType: null,
  framework: null,
  values: {},
  fields: [],
}

describe('configStore', () => {
  beforeEach(() => {
    // 使用 merge 模式重置数据属性（不替换 action 函数）
    useConfigStore.setState(initialState)
  })

  it('初始状态 step=1', () => {
    const state = useConfigStore.getState()
    expect(state.step).toBe(1)
    expect(state.templateType).toBeNull()
    expect(state.framework).toBeNull()
    expect(state.values).toEqual({})
    expect(state.fields).toEqual([])
  })

  it('setTemplateType 更新模板类型并跳转到 step=2', () => {
    useConfigStore.getState().setTemplateType('form')
    const state = useConfigStore.getState()
    expect(state.templateType).toBe('form')
    expect(state.step).toBe(2)
    expect(state.values).toEqual({})
    expect(state.fields).toEqual([])
  })

  it('setTemplateType 重置 values 和 fields', () => {
    useConfigStore.getState().setFieldValue('key', 'value')
    useConfigStore.getState().setTemplateType('crud')
    const state = useConfigStore.getState()
    expect(state.values).toEqual({})
    expect(state.fields).toEqual([])
  })

  it('setFramework 更新框架并跳转到 step=3', () => {
    useConfigStore.getState().setFramework('react')
    const state = useConfigStore.getState()
    expect(state.framework).toBe('react')
    expect(state.step).toBe(3)
  })

  it('setFieldValue 设置单个字段值', () => {
    useConfigStore.getState().setFieldValue('name', 'TestForm')
    expect(useConfigStore.getState().values.name).toBe('TestForm')

    useConfigStore.getState().setFieldValue('count', 5)
    expect(useConfigStore.getState().values.count).toBe(5)
  })

  it('setFields 替换字段数组', () => {
    const fields = [{ name: 'username', label: '用户名', type: 'text', required: true }]
    useConfigStore.getState().setFields(fields)
    expect(useConfigStore.getState().fields).toEqual(fields)
  })

  it('resetConfig 恢复初始状态', () => {
    useConfigStore.getState().setTemplateType('form')
    useConfigStore.getState().setFramework('react')
    useConfigStore.getState().setFieldValue('name', 'test')
    useConfigStore.getState().resetConfig()

    const state = useConfigStore.getState()
    expect(state.step).toBe(1)
    expect(state.templateType).toBeNull()
    expect(state.framework).toBeNull()
    expect(state.values).toEqual({})
    expect(state.fields).toEqual([])
  })

  it('importConfig 模板+框架都有时 step=3', () => {
    const parsed = {
      templateType: 'form',
      framework: 'react',
      values: { name: 'TestForm' },
      fields: [{ name: 'username', label: '用户名', type: 'text', required: true }],
    } as ParsedSkill
    useConfigStore.getState().importConfig(parsed)
    expect(useConfigStore.getState().step).toBe(3)
  })

  it('importConfig 仅有模板时 step=2', () => {
    const parsed = {
      templateType: 'form',
      framework: null,
      values: {},
      fields: [],
    } as ParsedSkill
    useConfigStore.getState().importConfig(parsed)
    expect(useConfigStore.getState().step).toBe(2)
  })

  it('importConfig 无模板无框架时 step=1', () => {
    const parsed = {
      templateType: null,
      framework: null,
      values: {},
      fields: [],
    } as ParsedSkill
    useConfigStore.getState().importConfig(parsed)
    expect(useConfigStore.getState().step).toBe(1)
  })
})
