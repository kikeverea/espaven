import type { PersistedRecord } from '@/types'

export type Role = 'admin' | 'technician' | 'office'


export type User = PersistedRecord &
{
  fullName: string
  roles: Role[]
  email: string
}

export type Admin = User & {
  roles: ['admin', ...Role[]]
}

export type Technician = User & {
  roles: ['technician', ...Role[]]
}

export type Office = User & {
  roles: ['office', ...Role[]]
}

export type FormUser = Partial<User>
