import * as z from 'zod'
import { toast } from '@/components/ui/toast.tsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '@/components/Form/FormInput.tsx'
import FormMultiInput from '@/components/Form/FormMultiInput.tsx'
import { Button, type ButtonVariants } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import FormTextarea from '@/components/Form/FormTextarea.tsx'
import { extractSchema, getFieldInfo } from '@/components/Form/util.ts'
import FormSelect from '@/components/Form/FormSelect.tsx'
import FormCheckbox from '@/components/Form/FormCheckbox.tsx'
import FormDatePicker from '@/components/Form/FormDatePicker.tsx'
import { type ComponentType, type PropsWithChildren, useEffect } from 'react'
import type { Mutations } from '@/lib/mutations.tsx'
import type { FormConfig, FormFields, InferSchema } from '@/components/Form/types.ts'
import type { Entity } from '@/types.ts'
import { capitalize } from '@/lib/strings.ts'

export type FormCallbacks = {
  onCancel?: () => void
  onCreate?: () => void
  onUpdate?: () => void
}

type FormProps<
  T extends Entity,
  TSubmit extends Record<string, unknown>,
  F extends FormFields
> = {
  name: string
  itemName: string | readonly [string, 'm'|'f']
  config: FormConfig<T, TSubmit, F, InferSchema<F>>
  mutations: Mutations<T, TSubmit>
  item: Partial<T>
  FormContainer?: ComponentType<PropsWithChildren>
  ButtonsContainer?: ComponentType<PropsWithChildren>
  confirmButton?: { label: string, variant: ButtonVariants }
  cancelButton?: { label: string, variant: ButtonVariants }
} & FormCallbacks

const FallbackContainer = ({ children }: PropsWithChildren) => <>{ children }</>

const Form = <T extends Entity, TSubmit extends Record<string, unknown>, F extends FormFields>({
  name,
  itemName,
  config,
  mutations,
  item,
  onCreate,
  onUpdate,
  onCancel,
  FormContainer = FallbackContainer,
  ButtonsContainer = FallbackContainer,
  confirmButton,
  cancelButton,
}: FormProps<T, TSubmit, F>) => {


  const { create, update, status } = mutations

  const formName = `${name}-form`
  const schema = extractSchema(config)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    disabled: status.pending.any,
    defaultValues: config.defaultValues
  })

  useEffect(() => {
    if (!item || !Object.keys(item).length)
      return

    form.reset(config.toFormData(item as T))
  }, [item, form])

  const handleSubmit = (formData: z.infer<typeof schema>) => {
    if (item === null) return

    const onSuccess = () => {
      const [ name, gender = 'm' ] = Array.isArray(itemName) ? itemName : [itemName]

      toast.add({ title: `${capitalize(name)} ${gender === 'm' ? 'guardado' : 'guardada'}` })
      if (item.id != null)
        onUpdate?.() || form.reset()
      else
        onCreate?.() || form.reset()
    }

    const submitItem = config.toSubmitData(item as T, formData as InferSchema<typeof config.fields>)

    if (item.id != null)
      update({ id: item.id, payload: submitItem }, { onSuccess })
    else
      create(submitItem, { onSuccess })
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  const { label: confirmLabel, variant: confirmVariant } = confirmButton || {}
  const { label: cancelLabel, variant: cancelVariant } = cancelButton || {}

  return (
    <>
      <FormContainer>
        <form id={ formName } onSubmit={form.handleSubmit(handleSubmit)} >
          { Object.entries(config.fields).map(([ name, field ]) => {

            const fieldInfo = getFieldInfo(field)
            const props = { form, name, label: field.label, required: fieldInfo.required }

            switch (fieldInfo.kind) {
              case 'string':
                return field.variation === 'textarea' ?
                  <FormTextarea {...props } key={ name } /> :
                  <FormInput {...props } key={ name } type={ field.type || 'text' } />
              case 'number':
                return <FormInput {...props } key={ name } type='number' step={ fieldInfo.step || "any" }/>
              case 'boolean':
                return <FormCheckbox {...props } key={ name } />
              case 'enum':
                return <FormSelect{...props } key={ name } items={ fieldInfo.options }/>
              case 'date':
                return <FormDatePicker {...props } key={ name } />
              case 'array':
                return <FormMultiInput{...props } key={ name } addMessage={ field.placeholder }/>
              default:
                throw new Error(`Invalid field info: ${fieldInfo}`)
            }
          })}
        </form>
      </FormContainer>

      <ButtonsContainer>
        <div className='pt-4 flex gap-2'>
          <Button type='button' variant={cancelVariant || 'outline'} onClick={ handleCancel } disabled={ status.pending.any }>
            {cancelLabel || 'Cancelar'}
          </Button>
          <Button type='submit' form={ formName } variant={confirmVariant || 'default'} disabled={ status.pending.any }>
            {confirmLabel || 'Guardar'}
            { status.pending.any && <Spinner />}
          </Button>
        </div>
      </ButtonsContainer>
    </>
  )
}

export default Form