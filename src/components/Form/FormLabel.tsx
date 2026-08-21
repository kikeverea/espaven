import { FieldLabel } from '@/components/ui/field.tsx'
import type { ComponentProps } from 'react'
import type { Label } from '@/components/ui/label.tsx'

type FormLabelProps = ComponentProps<typeof Label> & { label?: string, required?: boolean }

const FormLabel = ({ label, required, ...props }: FormLabelProps) => {
  if (!label)
    return null

  return (
    <FieldLabel htmlFor={props.htmlFor}>
      {label}
      {required && <span className="text-destructive">*</span>}
    </FieldLabel>
  )
}

export default FormLabel