'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import type { Inquiry } from '@/features/types.ts'

const formSchema = z
.object({
  name: z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(48, 'Máximo 48 caracteres'),

  lastName: z.string().optional(),

  emails: z.array(
    z.string().email('Email no válido')
  ),

  phoneNumbers: z.array(
    z.string().min(1, 'Teléfono no válido')
  ),
})
.refine(
  (data) => data.emails.length > 0 || data.phoneNumbers.length > 0,
  {
    message: 'Añade al menos un email o teléfono',
    path: ['emails']
  }
)

type InquiryFormProps = {
  inquiry: Partial<Inquiry>
}

export const InquiryForm = ({ inquiry }: InquiryFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: ''
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast('You submitted the following values:', {
      description: (
        <pre className='mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground'>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: 'bottom-right',
      classNames: {
        content: 'flex flex-col gap-2',
      },
      style: {
        '--border-radius': 'calc(var(--radius)  + 4px)',
      } as React.CSSProperties,
    })
  }

  return (
    <Card className='w-full sm:max-w-md'>
      <CardHeader>
        <CardTitle>
          { inquiry.id ? 'Editar' : 'Nueva'} Solicitud
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id='inquiry-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='inquiry-form-name'>
                    Bug Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id='inquiry-form-name'
                    aria-invalid={fieldState.invalid}
                    placeholder='Login button not working on mobile'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='description'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='inquiry-form-description'>
                    Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id='inquiry-form-description'
                      placeholder="I'm having an issue with the login button on mobile."
                      rows={6}
                      className='min-h-24 resize-none'
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align='block-end'>
                      <InputGroupText className='tabular-nums'>
                        {field.value.length}/100 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Include steps to reproduce, expected behavior, and what
                    actually happened.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation='horizontal'>
          <Button type='button' variant='outline' onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type='submit' form='inquiry-form'>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
