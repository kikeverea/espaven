import * as z from 'zod'
import type { Mutations } from '@/lib/mutations.tsx'
import type { Entity } from '@/types.ts'
import { toast } from '@/components/ui/toast.tsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '@/components/Form/FormInput.tsx'
import FormMultiInput from '@/components/Form/FormMultiInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { type ComponentProps, type ComponentType, type PropsWithChildren } from 'react'
import FormTextarea from '@/components/Form/FormTextarea.tsx'
import { getFieldInfo } from '@/components/Form/util.ts'
import FormSelect from '@/components/Form/FormSelect.tsx'
import FormCheckbox from '@/components/Form/FormCheckbox.tsx'
import FormDatePicker from '@/components/Form/FormDatePicker.tsx'
import { Input } from '@base-ui/react'

type ContainerProps = PropsWithChildren

export type InferFormData<T extends Record<string, { schema: z.ZodType }>> = {
  [K in keyof T]: z.infer<T[K]['schema']>
}

export type FieldVariation =
  | 'email'
  | 'textarea'
  | 'options'

type FormField = {
  schema: z.ZodType
  variation?: FieldVariation
  type?: ComponentProps<typeof Input>['type']
  label?: string
  placeholder?: string
}

export type FormConfig = {
  fields: Record<string, FormField>
  refine?: {
    fn: (data: { [x: string]: any }) => boolean
    args?: Parameters<z.ZodType['refine']>[1]
  }
}

type FormProps<T extends Entity, NT extends Omit<Partial<Entity>, 'id'>> = {
  name: string
  config: FormConfig
  mutations: Mutations<T, NT>
  item: T | NT
  applyData?: (item: T | NT, formData: any) => T | NT
  onCancel?: () => void
  FormContainer?: ComponentType<ContainerProps>
  ButtonsContainer?: ComponentType<ContainerProps>
}

export const extractSchema = (config: FormConfig) => {
  const schema = z.object(
    Object.fromEntries(
      Object.entries(config.fields).map(([key, field]) => [key, field.schema]),
    )
  )

  return config.refine
    ? schema.refine(config.refine.fn, config.refine?.args || {})
    : schema
}

const Form = <T extends Entity, NT extends Omit<Partial<Entity>,'id'>>({
  name,
  config,
  mutations,
  item,
  applyData,
  onCancel,
  FormContainer = ({ children }: ContainerProps) => <>{children}</>,
  ButtonsContainer = ({ children }: ContainerProps) => <>{children}</>,
}: FormProps<T,NT>) => {

  const { create, update, status } = mutations

  const formName = `${name}-form`

  const schema = extractSchema(config)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    disabled: status.pending.any
  })

  const handleSubmit = (formData: z.infer<typeof schema>) => {
    if (item === null) return

    const onSuccess = () => {
      toast.add({ title: 'Solicitud guardada' })
      form.reset()
    }

    const submitItem = applyData ? applyData(item, formData) : { ...item, ...formData }

    if ('id' in submitItem)
      update(submitItem, { onSuccess })
    else
      create(submitItem, { onSuccess })
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }
  return (
    <>
      <FormContainer>
        <form id={ formName } onSubmit={form.handleSubmit(handleSubmit)} >
          { Object.entries(config.fields).map(([ name, field ]) => {

            const fieldInfo = getFieldInfo(field.schema)
            const props = { form, name, label: field.label, required: fieldInfo.required }

            switch (fieldInfo.kind) {
              case 'string':
                return field.variation === 'textarea' ?
                  <FormTextarea {...props} key={ name } /> :
                  <FormInput {...props} key={ name } type={ field.type || 'text' } />
              case 'number':
                return <FormInput {...props} key={ name } type='number'/>
              case 'boolean':
                return <FormCheckbox {...props} key={ name } />
              case 'enum':
                return <FormSelect{...props} key={ name } items={ fieldInfo.options }/>
              case 'date':
                return <FormDatePicker {...props} key={ name } />
              case 'array':
                return <FormMultiInput{...props} key={ name } addMessage={ field.placeholder }/>
              default:
                throw new Error(`Invalid field info: ${fieldInfo}`)
            }
          })}
        </form>
      </FormContainer>

      <ButtonsContainer>
        <div className='pt-4 flex gap-2'>
          <Button type='button' variant='outline' onClick={ handleCancel } disabled={ status.pending.any }>
            Cancelar
          </Button>
          <Button type='submit' form={ formName } disabled={ status.pending.any }>
            Guardar
            { status.pending.any && <Spinner />}
          </Button>
        </div>
      </ButtonsContainer>
    </>
  )
}

export default Form