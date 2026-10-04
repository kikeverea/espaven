import { afterEach, describe, expect, test, vi } from 'vitest'
import api from '@/features/workOrders/data/workOrder.api'

describe('workOrder api', () => {

  const respondWith = (payload: unknown) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
    )

  const bodyOf = (spy: ReturnType<typeof respondWith>) => JSON.parse(spy.mock.calls[0][1]?.body as string)

  afterEach(() => { vi.restoreAllMocks() })

  test('reads the api’s snake cased statuses as the app’s', async () => {
    respondWith({ collection: [
      { id: 1, status: 'in_progress', labour_minutes: 60 },
      { id: 2, status: 'pending_technician', labour_minutes: 30 },
      { id: 3, status: 'paused', labour_minutes: 30 },
    ] })

    const { collection } = await api.getAll()

    expect(collection.map(({ status }) => status)).toEqual([ 'inProgress', 'pendingTechnician', 'paused' ])
    expect(collection[0].labourMinutes).toBe(60)
  })

  test('reads a single one, as an update answers', async () => {
    respondWith({ id: 1, status: 'not_started' })
    expect((await api.get(1)).status).toBe('notStarted')
  })

  test('sends the status snake cased, with the rest as ever', async () => {
    const spy = respondWith({ id: 1, status: 'not_started' })

    await api.update(1, { id: 1, status: 'notStarted', scheduledAt: null, technicianIds: [ 2 ] } as never)

    expect(bodyOf(spy)).toEqual({ status: 'not_started', scheduled_at: null, technician_ids: [ 2 ] })
  })

  test('sends no status when there is none', async () => {
    const spy = respondWith({ id: 1, status: 'not_started' })

    await api.update(1, { labourMinutes: 30 })

    expect(bodyOf(spy)).toEqual({ labour_minutes: 30 })
  })
})
