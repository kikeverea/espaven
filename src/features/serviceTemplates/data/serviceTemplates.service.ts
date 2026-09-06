import type { ServiceTemplate } from '../types'
import { api } from '@/api/apiClient'

const { apiFetch, fetch } = api()

const getInquiries = (): Promise<ServiceTemplate[]> =>
  apiFetch<ServiceTemplate[]>(`/service_templates`)

const getServiceTemplate = (id: ServiceTemplate['id']): Promise<ServiceTemplate> =>
  apiFetch<ServiceTemplate>(`/service_templates/${id}`)

const createServiceTemplate = async (payload: Partial<ServiceTemplate>): Promise<ServiceTemplate> => {
  return await apiFetch<ServiceTemplate>(`/service_templates`, {
    method: 'POST',
    body: payload
  })
}

const updateServiceTemplate = async (id: ServiceTemplate['id'], template: Partial<ServiceTemplate>): Promise<ServiceTemplate> => {
  return await apiFetch<ServiceTemplate>(`/service_templates/${id}`, {
    method: 'PUT',
    body: template,
  })
}

const deleteServiceTemplate = async (template: Partial<ServiceTemplate>): Promise<ServiceTemplate> => {
  return await apiFetch<ServiceTemplate>(`/service_templates/${template.id}`, { method: 'DELETE' })
}

const deleteInquiries = async (ids: ServiceTemplate['id'][]): Promise<boolean[]> => {
  return await fetch<boolean[]>(`/service_templates/batch_destroy`, {
    method: 'POST',
    body: { ids: ids }
  })
}

export default { getInquiries, getServiceTemplate, createServiceTemplate, updateServiceTemplate, deleteServiceTemplate, deleteInquiries }
