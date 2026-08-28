import * as z from 'zod'
import { toast } from '@/components/ui/toast.tsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '@/components/Form/FormInput.tsx'
import FormMultiInput from '@/components/Form/FormMultiInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import FormTextarea from '@/components/Form/FormTextarea.tsx'
import { extractSchema, getFieldInfo } from '@/components/Form/util.ts'
import FormSelect from '@/components/Form/FormSelect.tsx'
import FormCheckbox from '@/components/Form/FormCheckbox.tsx'
import FormDatePicker from '@/components/Form/FormDatePicker.tsx'
import type { ComponentType, PropsWithChildren } from 'react'
import type { Mutations } from '@/lib/mutations.tsx'
import type { FormConfig, FormFields } from '@/components/Form/types.ts'
import type { Entity } from '@/types.ts'
import { capitalize } from '@/lib/strings.ts'

type ContainerProps = PropsWithChildren
type AnyFormConfig = FormConfig<FormFields>

type FormProps<
  T extends Entity,
  TWrite extends object,
  C extends AnyFormConfig
> = {
  name: string
  itemName: string | readonly [string, 'm'|'f']
  config: C
  mutations: Mutations<T, TWrite>
  item: T | TWrite
  applyData?: (item: T | TWrite, formData: any) => TWrite
  onCancel?: () => void
  FormContainer?: ComponentType<ContainerProps>
  ButtonsContainer?: ComponentType<ContainerProps>
}

const FallbackContainer = ({ children }: ContainerProps) => <>{ children }</>

const Form = <T extends Entity, TWrite extends object, C extends AnyFormConfig
>({
  name,
  itemName,
  config,
  mutations,
  item,
  applyData,
  onCancel,
  FormContainer = FallbackContainer,
  ButtonsContainer = FallbackContainer,
}: FormProps<T, TWrite, C>) => {

  const { create, update, status } = mutations

  const formName = `${name}-form`
  const schema = extractSchema(config)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    disabled: status.pending.any,
    defaultValues: config.defaultValues
  })

  const handleSubmit = (formData: z.infer<typeof schema>) => {
    if (item === null) return

    const onSuccess = () => {
      const [ name, gender = 'm' ] = Array.isArray(itemName) ? itemName : [itemName]

      toast.add({ title: `${capitalize(name)} ${gender === 'm' ? 'guardado' : 'guardada'}` })
      form.reset()
    }

    const submitItem = applyData ? applyData(item, formData) : { ...item, ...formData } as TWrite

    if ('id' in item)
      update({ id: item.id, payload: submitItem }, { onSuccess })
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