import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import useDebouncedCallback from './useDebouncedCallback'

describe('useDebouncedCallback', () => {

  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  const renderDebounced = (callback: (value: string) => void, initial = '') =>
    renderHook(({ value }) => useDebouncedCallback(value, 300, callback), {
      initialProps: { value: initial }
    })

  test('does not fire for the value it started with', () => {
    const callback = vi.fn()
    renderDebounced(callback)

    vi.advanceTimersByTime(1000)

    expect(callback).not.toHaveBeenCalled()
  })

  test('fires once the value stops changing', () => {
    const callback = vi.fn()
    const { rerender } = renderDebounced(callback)

    rerender({ value: 'turbo' })
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(callback).toHaveBeenCalledExactlyOnceWith('turbo')
  })

  test('collapses a burst of changes into the last one', () => {
    const callback = vi.fn()
    const { rerender } = renderDebounced(callback)

    for (const value of ['t', 'tu', 'tur', 'turb', 'turbo']) {
      rerender({ value })
      vi.advanceTimersByTime(100)     // never long enough to settle
    }

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(callback).toHaveBeenCalledExactlyOnceWith('turbo')
  })

  test('fires again for a later change', () => {
    const callback = vi.fn()
    const { rerender } = renderDebounced(callback)

    rerender({ value: 'turbo' })
    vi.advanceTimersByTime(300)

    rerender({ value: 'filtro' })
    vi.advanceTimersByTime(300)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith('filtro')
  })

  test('does not fire for a value that came back to where it was', () => {
    const callback = vi.fn()
    const { rerender } = renderDebounced(callback)

    rerender({ value: 'turbo' })
    rerender({ value: '' })
    vi.advanceTimersByTime(300)

    expect(callback).not.toHaveBeenCalled()
  })
})
