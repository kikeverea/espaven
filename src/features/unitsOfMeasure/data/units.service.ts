import type { FormUnitOfMeasure, UnitOfMeasure } from '../types'
import { api } from '@/api/apiClient.ts'

const { apiFetch, fetch } = api()

const getUnitOfMeasures = async (): Promise<UnitOfMeasure[]> => {
  return await apiFetch<UnitOfMeasure[]>(`/units_of_measure`)
}

const getUnitOfMeasure = async (id: UnitOfMeasure['id']): Promise<UnitOfMeasure> => {
  return await apiFetch<UnitOfMeasure>(`/units_of_measure/${id}`)
}

const createUnitOfMeasure = async (payload: FormUnitOfMeasure): Promise<UnitOfMeasure> => {
  return await apiFetch<UnitOfMeasure>(`/units_of_measure`, {
    method: 'POST',
    body: payload
  })
}

const updateUnitOfMeasure = async (id: UnitOfMeasure['id'], unitOfMeasure: FormUnitOfMeasure):
  Promise<UnitOfMeasure> =>
{
  return await apiFetch<UnitOfMeasure>(`/units_of_measure/${id}`, {
    method: 'PUT',
    body: unitOfMeasure,
  })
}

const deleteUnitOfMeasure = async (unitOfMeasure: UnitOfMeasure): Promise<UnitOfMeasure> => {
  return await apiFetch<UnitOfMeasure>(`/units_of_measure/${unitOfMeasure.id}`, { method: 'DELETE' })
}

const deleteUnitOfMeasures = async (ids: UnitOfMeasure['id'][]): Promise<boolean[]> => {
  return await fetch<boolean[]>(`/units_of_measure/batch_destroy`, {
    method: 'POST',
    body: { ids: ids }
  })
}

export default {
  getUnitOfMeasures,
  getUnitOfMeasure,
  createUnitOfMeasure,
  updateUnitOfMeasure,
  deleteUnitOfMeasure,
  deleteUnitOfMeasures
}
