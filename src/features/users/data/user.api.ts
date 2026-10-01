import type { FormUser, User } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<User, FormUser>('/users')
