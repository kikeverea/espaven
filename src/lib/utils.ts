import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Entity } from '@/types.ts'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const findById = <T extends Entity>(collection: T[], id: T['id']) =>
  collection.find(item => item.id === id ) || null
