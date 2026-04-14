import { describe, it, expect } from 'vitest'
import { TEMPLATE_SCHEMAS } from '@/lib/template-schemas'

const TEMPLATE_TYPES = ['form', 'crud', 'api', 'unit-test', 'hooks', 'state', 'utils'] as const

describe('template-schemas', () => {
  it('导出所有 7 种模板类型', () => {
    for (const type of TEMPLATE_TYPES) {
      expect(TEMPLATE_SCHEMAS).toHaveProperty(type)
    }
    expect(Object.keys(TEMPLATE_SCHEMAS).length).toBe(7)
  })

  it('每个 schema 有必需字段', () => {
    for (const type of TEMPLATE_TYPES) {
      const schema = TEMPLATE_SCHEMAS[type]
      expect(schema.templateType).toBe(type)
      expect(schema.label).toBeTruthy()
      expect(schema.icon).toBeTruthy()
      expect(schema.description).toBeTruthy()
      expect(schema.supportedFrameworks).toContain('react')
      expect(schema.supportedFrameworks).toContain('vue3')
      expect(Array.isArray(schema.fields)).toBe(true)
      expect(schema.fields.length).toBeGreaterThan(0)
    }
  })

  it('每个 field schema 有 key/label/type', () => {
    for (const type of TEMPLATE_TYPES) {
      for (const field of TEMPLATE_SCHEMAS[type].fields) {
        expect(field).toHaveProperty('key')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('type')
        expect(field.key).toBeTruthy()
        expect(field.label).toBeTruthy()
        expect(field.type).toBeTruthy()
      }
    }
  })

  it('select 类型 field 有 options', () => {
    for (const type of TEMPLATE_TYPES) {
      for (const field of TEMPLATE_SCHEMAS[type].fields) {
        if (field.type === 'select') {
          expect(field).toHaveProperty('options')
          expect(Array.isArray(field.options)).toBe(true)
          expect(field.options!.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
