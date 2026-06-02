import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date string (YYYY-MM-DD) to a localized Spanish display string */
export function formatDateEs(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

/** Get today's date as a YYYY-MM-DD string in local time */
export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Round a number to a given number of decimal places */
export function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals
}

/** API response helpers for Route Handlers */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}
