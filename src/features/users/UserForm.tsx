import type { User } from '@/features/users/types'
import { useUserMutations } from '@/features/users/useUsers'
import { config } from '@/features/users/data/user.form'
import CardForm from '@/components/Form/CardForm'
import type { FormCallbacks } from '@/components/Form/Form'
import type { ComponentProps } from 'react'

type UserFormProps = FormCallbacks & ComponentProps<'div'> & {
  name: string
  user: Partial<User> | null
  className?: string
}

const UserForm = ({
  name='user',
  user,
  onCreate,
  onUpdate,
  onCancel,
  className
}: UserFormProps) => {

  return (
    <CardForm
      name={ name }
      className={ className }
      itemName={[ 'Usuario', 'm' ]}
      justify='fluid'
      config={ config }
      item={ user }
      mutations={ useUserMutations() }
      onCreate={ onCreate }
      onUpdate={ onUpdate }
      onCancel={ onCancel }
    />
  )
}

export default UserForm
