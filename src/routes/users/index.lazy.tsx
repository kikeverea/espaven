import { createLazyFileRoute } from '@tanstack/react-router'
import UsersIndex from '@/features/users/UsersIndex'

export const Route = createLazyFileRoute('/users/')({
  component: () => <UsersIndex />
})
