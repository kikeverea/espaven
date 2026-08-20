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
import { type JSX } from 'react'
import FormTextarea from '@/components/Form/FormTextarea.tsx'

type FormField = {
  type: string,
  schema: z.ZodString
  label?: string,
  required?: boolean,
}

type FormProps<T extends Entity, NT extends Omit<Partial<Entity>, 'id'>> = {
  name: string
  fields: Record<string, FormField>
  mutations: Mutations<T, NT>
  item: T | NT
  applyData?: (item: T | NT ) => T | NT
  onCancel?: () => void
  FormContainer?: JSX.Element
  ButtonsContainer?: JSX.Element
}

const Form = <T extends Entity, NT extends Omit<Partial<Entity>,'id'>>({
  name,
  fields,
  mutations,
  item,
  applyData,
  onCancel,
  FormContainer = <></>,
  ButtonsContainer = <></>,
}: FormProps<T,NT>) => {

  const { create, update, status } = mutations

  const formName = `${name}-form`

  if (status.errors.creating)
    toast.add({ title: status.errors.creating.error?.message, type: 'error' })

  const schema = z.object(
    Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [key, field.schema]),
    )
  )

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    disabled: status.pending.any
  })

  const handleSubmit = (formData: z.infer<typeof schema>) => {
    if (item === null) return

    const submitItem = applyData(item, formData)

    const onSuccess = () => {
      toast.add({ title: 'Solicitud guardada' })
      form.reset()
    }

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
          { Object.entries(fields).map(([ name, field ]) => {

            switch (field.type) {
              case 'input':
                return (
                  <FormInput form={ form } name={ name } label={ field.label } required={ field.required } />
                )
              case 'textarea':
                return (
                  <FormTextarea form={ form } name={ name } label={ field.label } required={ field.required } />
                )
              case 'array':
                return (
                  <FormMultiInput form={ form } values={ emails } name='emails' label="Emails" addMessage='Añadir email' />
                )
              default:
                throw new Error(`Invalid field type: ${field.type}`)
            }
          })}
        </form>
      </FormContainer>

      <ButtonsContainer>
        <div className='px-4 flex gap-2'>
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