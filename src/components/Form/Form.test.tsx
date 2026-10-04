import * as z from 'zod'
import Form from '@/components/Form/Form.tsx'
import { render } from '@/test/render.tsx'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { Mutations } from '@/lib/mutations.tsx'
import type { Entity } from '@/types.ts'
import type { FormField } from '@/components/Form/types.ts'
import { afterEach, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'


describe('Form', () => {

  type TestEntity = Entity & { name?: string, notes?: string }
  type NewEntity = Omit<Partial<TestEntity>, 'id'>

  const mutationsMock: Mutations<TestEntity, NewEntity> = {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    status: {
      pending: { create: null, update: null, delete: null, any: false, current: () => null  },
      errors: { create: null, update: null, delete: null, any: false, error: () => null  },
    }
  }

  const props = {
    name: 'test',
    itemName: 'test',
    mutations: mutationsMock,
    item: {}
  }

  type TestFields = Record<string, { schema: z.ZodType, variation?: 'textarea', label?: string, feedback?: (value: string) => string, onChange?: FormField['onChange'] }>

  const configOf = <F extends TestFields>(fields: F) =>
    defineFormConfig<TestEntity, NewEntity, F>({ fields })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('renders text input', () => {
    const config = configOf({ test: { schema: z.string() }})

    render(<Form {...props} config={config} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('renders number input', () => {
    const config = configOf({ test: { schema: z.number() }})

    render(<Form {...props} config={config} />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  test('renders text area', () => {
    const config = configOf({ test: { schema: z.string(), variation: 'textarea' as const }})

    render(<Form {...props} config={config} />)
    const textbox = screen.getByRole('textbox')

    expect(textbox.tagName).toBe('TEXTAREA')
  })

  test('renders select', () => {
    const config = configOf({ test: { schema: z.enum(['admin', 'user', 'guest']) }})

    render(<Form {...props} config={config} />)
    const select = screen.getByRole('combobox')

    expect(select).toBeInTheDocument()
  })

  test('renders checkbox', () => {
    const config = configOf({ test: { schema: z.boolean() }})

    render(<Form {...props} config={config} />)
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toBeInTheDocument()
  })

  test('renders the fields of a layout row on the same line', () => {
    const config = {
      ...configOf({
        name: { schema: z.string() },
        hours: { schema: z.number() },
        minutes: { schema: z.number() },
      }),
      layout: [ 'name', [ 'hours', 'minutes' ] ] as [ 'name', [ 'hours', 'minutes' ] ],
    }

    render(<Form {...props} config={config} />)

    const [ hours, minutes ] = screen.getAllByRole('spinbutton')
    const row = hours.closest('.flex.gap-4')

    expect(row).toContainElement(minutes)
    expect(row).not.toContainElement(screen.getByRole('textbox'))
  })

  test('labels the input without leaking the label onto it', () => {
    const config = configOf({ name: { schema: z.string(), label: 'Nombre' }})

    render(<Form {...props} config={config} />)

    expect(screen.getByRole('textbox')).not.toHaveAttribute('label')
    expect(screen.getByText('Nombre')).toBeInTheDocument()
  })

  /* Switches the edited item without unmounting the form, the way an index page does */
  const FormHarness = <F extends TestFields>(
    { config, items }: { config: ReturnType<typeof configOf<F>>, items: Partial<TestEntity>[] }
  ) => {
    const [index, setIndex] = useState(0)

    return (
      <>
        <button type='button' onClick={() => setIndex(index + 1)}>next item</button>
        <Form {...props} config={config} item={items[index] ?? {}} />
      </>
    )
  }

  const nextItem = async (user: ReturnType<typeof userEvent.setup>) =>
    user.click(screen.getByRole('button', { name: 'next item' }))

  test('fields missing from the edited item are reset to their empty value', async () => {
    const user = userEvent.setup()
    const config = configOf({
      name: { schema: z.string() },
      notes: { schema: z.string().optional() },
    })

    render(<FormHarness config={config} items={[
      { id: 1, name: 'Item', notes: 'Some notes' },
      { id: 2, name: 'Other item' },
    ]} />)

    const inputs = () => screen.getAllByRole('textbox') as HTMLInputElement[]

    expect(inputs().map(input => input.value)).toEqual([ 'Item', 'Some notes' ])

    await nextItem(user)
    expect(inputs().map(input => input.value)).toEqual([ 'Other item', '' ])
  })

  test('clears the form when switching from an edited item to a new one', async () => {
    const user = userEvent.setup()
    const config = configOf({ name: { schema: z.string() }})

    render(<FormHarness config={config} items={[{ id: 1, name: 'Item' }]} />)

    const input = () => screen.getByRole('textbox') as HTMLInputElement
    expect(input().value).toBe('Item')

    /* No item left, the form switches to creating a new one */
    await nextItem(user)
    expect(input().value).toBe('')
  })

  test('does not clear the form on re-renders while creating a new item', async () => {
    const user = userEvent.setup()
    const config = configOf({ name: { schema: z.string() }})

    /* Index components pass a brand new `{}` on every render */
    render(<FormHarness config={config} items={[]} />)

    const input = () => screen.getByRole('textbox') as HTMLInputElement

    await user.type(input(), 'Typing')
    await nextItem(user)

    expect(input().value).toBe('Typing')
  })

  test('clears fields that are not plain inputs', async () => {
    const user = userEvent.setup()
    const config = configOf({
      family: { schema: z.enum([ 'Feline', 'Canine' ]) },
      wild: { schema: z.boolean() },
    })

    render(<FormHarness config={config} items={[{ id: 1, family: 'Feline', wild: true } as never]} />)

    expect(screen.getByRole('combobox')).toHaveTextContent('Feline')
    expect(screen.getByRole('checkbox')).toBeChecked()

    await nextItem(user)

    expect(screen.getByRole('combobox')).not.toHaveTextContent('Feline')
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  test('leaves number inputs blank, not zeroed', async () => {
    const user = userEvent.setup()
    const config = configOf({ age: { schema: z.coerce.number() }})

    render(<FormHarness config={config} items={[{ id: 1, age: 10 } as never]} />)

    const input = () => screen.getByRole('spinbutton') as HTMLInputElement
    expect(input().value).toBe('10')

    await nextItem(user)
    expect(input().value).toBe('')
  })

  test('cancelling after an edit clears the form', async () => {
    const user = userEvent.setup()
    const config = configOf({ name: { schema: z.string() }})

    render(<FormHarness config={config} items={[{ id: 1, name: 'Item' }]} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
  })

  describe('onChange', () => {

    /* hours and minutes, each setting the other */
    const config = configOf({
      hours: {
        schema: z.coerce.number().min(0).max(10),
        onChange: (hours, set) => set('minutes', Number(hours) * 60),
      },
      minutes: {
        schema: z.coerce.number().min(0),
        onChange: (minutes, set) => set('hours', Number(minutes) / 60),
      },
    })

    const inputs = () => screen.getAllByRole('spinbutton') as HTMLInputElement[]

    test('sets the other field as the user edits one, without looping back', async () => {
      const user = userEvent.setup()
      render(<Form {...props} config={config} />)

      await user.type(inputs()[1], '90')
      expect(inputs().map(input => input.value)).toEqual([ '1.5', '90' ])

      await user.clear(inputs()[0])
      await user.type(inputs()[0], '2')
      expect(inputs().map(input => input.value)).toEqual([ '2', '120' ])
    })

    test('does not set the other field from a value the schema rejects', async () => {
      const user = userEvent.setup()
      render(<Form {...props} config={config} />)

      /* '1' is set along, '12' is over the maximum */
      await user.type(inputs()[0], '12')

      expect(inputs()[0].value).toBe('12')
      expect(inputs()[1].value).toBe('60')
    })
  })

  describe('feedback', () => {

    const length = (value: string) => `${value.length} caracteres`

    test('shows the feedback of what is typed below the input', async () => {
      const user = userEvent.setup()
      const config = configOf({ name: { schema: z.string(), feedback: length }})

      render(<Form {...props} config={config} />)
      await user.type(screen.getByRole('textbox'), 'Hola')

      expect(screen.getByText('4 caracteres')).toBeInTheDocument()
    })

    test('shows the feedback of the edited item, and follows it when the item changes', async () => {
      const user = userEvent.setup()
      const config = configOf({ name: { schema: z.string(), feedback: length }})

      /* the value arrives through a form reset, not through typing */
      render(<FormHarness config={config} items={[{ id: 1, name: 'Item' }]} />)
      expect(screen.getByText('4 caracteres')).toBeInTheDocument()

      await nextItem(user)
      expect(screen.getByText('0 caracteres')).toBeInTheDocument()
    })

    test('shows the feedback of text areas', async () => {
      const user = userEvent.setup()
      const config = configOf({ notes: { schema: z.string(), variation: 'textarea' as const, feedback: length }})

      render(<Form {...props} config={config} />)
      await user.type(screen.getByRole('textbox'), 'Notas')

      expect(screen.getByText('5 caracteres')).toBeInTheDocument()
    })

    test('shows the feedback of number inputs', async () => {
      const user = userEvent.setup()
      const config = configOf({ price: { schema: z.coerce.number(), feedback: value => `Total: ${value} €` }})

      render(<Form {...props} config={config} />)
      await user.type(screen.getByRole('spinbutton'), '12')

      expect(screen.getByText('Total: 12 €')).toBeInTheDocument()
    })

    test('shows the error instead of the feedback while the field is invalid', async () => {
      const user = userEvent.setup()
      const config = configOf({ name: { schema: z.string().min(2, 'Mínimo 2 caracteres'), feedback: length }})

      render(<Form {...props} config={config} />)
      await user.type(screen.getByRole('textbox'), 'A')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(screen.getByText('Mínimo 2 caracteres')).toBeInTheDocument()
      expect(screen.queryByText('1 caracteres')).not.toBeInTheDocument()
    })

    test('shows nothing below the input without a feedback', () => {
      const config = configOf({ name: { schema: z.string() }})

      const { container } = render(<Form {...props} config={config} />)

      expect(container.querySelector('[data-slot="field-description"]')).not.toBeInTheDocument()
    })
  })
})
