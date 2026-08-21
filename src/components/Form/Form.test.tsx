import * as z from 'zod'
import Form from '@/components/Form/Form.tsx'
import { render } from '@/test/util.tsx'
import type { Mutations } from '@/lib/mutations.tsx'
import type { Entity } from '@/types.ts'
import { afterEach, expect } from 'vitest'
import { screen } from '@testing-library/react'


describe('Form', () => {

  type TestEntity = Entity
  type NewEntity = Omit<Partial<TestEntity>, 'id'>

  const mutationsMock: Mutations<TestEntity, NewEntity> = {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    status: {
      pending: { creating: null, deleting: null, any: false, current: () => null  },
      errors: { creating: null, deleting: null, any: false, error: () => null  },
    }
  }

  const props = {
    name: 'test',
    mutations: mutationsMock,
    item: {}
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('renders text input', () => {
    const fields = { test: { schema: z.string() }}

    render(<Form {...props} fields={fields} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('renders number input', () => {
    const fields = { test: { schema: z.number() }}

    render(<Form {...props} fields={fields} />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  test('renders text area', () => {
    const fields = { test: { schema: z.string(), variation: 'textarea' as const }}

    render(<Form {...props} fields={fields} />)
    const textbox = screen.getByRole('textbox')

    expect(textbox.tagName).toBe('TEXTAREA')
  })

  test('renders select', () => {
    const fields = { test: { schema: z.enum(['admin', 'user', 'guest']) }}

    render(<Form {...props} fields={fields} />)
    const select = screen.getByRole('combobox')

    expect(select).toBeInTheDocument()
  })

  test('renders checkbox', () => {
    const fields = { test: { schema: z.boolean() }}

    render(<Form {...props} fields={fields} />)
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toBeInTheDocument()
  })

})
