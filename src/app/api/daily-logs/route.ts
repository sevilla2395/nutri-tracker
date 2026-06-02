import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDailyLog, upsertLogEntry, deleteLogEntry } from '@/lib/db/logs'
import { logEntrySchema, deleteLogEntrySchema } from '@/lib/validations/log.schema'
import { apiSuccess, apiError } from '@/lib/utils'

/**
 * GET /api/daily-logs?planId=<uuid>&date=<YYYY-MM-DD>
 * Returns the full daily log with all entries for the given date and plan.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const planId = request.nextUrl.searchParams.get('planId')
    const date = request.nextUrl.searchParams.get('date')

    if (!planId || !date) return apiError('planId y date son requeridos', 400)

    const log = await getDailyLog(planId, date)
    return apiSuccess(log)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/**
 * POST /api/daily-logs
 * Creates a new log entry (with fractional exchange quantity).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const body = await request.json()
    const parsed = logEntrySchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422)

    const entry = await upsertLogEntry(parsed.data)
    return apiSuccess(entry, 201)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/**
 * DELETE /api/daily-logs?entryId=<uuid>
 * Deletes a specific log entry.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const entryId = request.nextUrl.searchParams.get('entryId')
    const parsed = deleteLogEntrySchema.safeParse({ entry_id: entryId })
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400)

    await deleteLogEntry(parsed.data.entry_id)
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
