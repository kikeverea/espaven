import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectList from '../projects'

export const Route = createLazyFileRoute('/')({
  component: ProjectList
})