'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2, CalendarDays } from 'lucide-react'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { getTodayString, round } from '@/lib/utils'
import { FoodSelectionModal } from './FoodSelectionModal'
import { MacroSummaryBar } from './MacroSummaryBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { FoodCategory, NutritionTotals } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────
interface Requirement {
  id: string
  category_id: string
  exchange_count: number
  food_categories: FoodCategory
}

interface LogEntry {
  id: string
  meal_slot_id: string
  requirement_id: string
  exchange_quantity: number
  food_exchanges: {
    id: string
    name: string
    portion_amount: string
    calories: number
    carbs_g: number
    protein_g: number
    fat_g: number
    fiber_g: number
    food_categories: FoodCategory
  }
}

interface MealSlot {
  id: string
  name: string
  display_order: number
  meal_slot_requirements: Requirement[]
}

interface Plan {
  id: string
  name: string
  meal_slots: MealSlot[]
}

interface DashboardClientProps {
  plan: Plan
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function DashboardClient({ plan }: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(
    new Set(plan.meal_slots.map((s) => s.id))
  )
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [logLoading, setLogLoading] = useState(true)

  // Food selection modal state
  const [selectionModal, setSelectionModal] = useState<{
    slot: MealSlot
    requirement: Requirement
  } | null>(null)

  // Fetch log for current date
  const fetchLog = useCallback(async (date: string) => {
    setLogLoading(true)
    try {
      const res = await fetch(`/api/daily-logs?planId=${plan.id}&date=${date}`)
      const json = await res.json()
      if (res.ok && json.data?.daily_log_entries) {
        setLogEntries(json.data.daily_log_entries)
      } else {
        setLogEntries([])
      }
    } catch {
      setLogEntries([])
    } finally {
      setLogLoading(false)
    }
  }, [plan.id])

  useEffect(() => {
    fetchLog(selectedDate)
  }, [selectedDate, fetchLog])

  // Get entries for a specific requirement
  const getReqEntries = (slotId: string, reqId: string) =>
    logEntries.filter((e) => e.meal_slot_id === slotId && e.requirement_id === reqId)

  // Calculate total consumed for a requirement
  const getConsumedCount = (slotId: string, reqId: string) =>
    getReqEntries(slotId, reqId).reduce((sum, e) => sum + e.exchange_quantity, 0)

  // Calculate daily nutrition totals
  const totals: NutritionTotals = logEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.food_exchanges.calories * entry.exchange_quantity,
      carbs_g: acc.carbs_g + entry.food_exchanges.carbs_g * entry.exchange_quantity,
      protein_g: acc.protein_g + entry.food_exchanges.protein_g * entry.exchange_quantity,
      fat_g: acc.fat_g + entry.food_exchanges.fat_g * entry.exchange_quantity,
      fiber_g: acc.fiber_g + entry.food_exchanges.fiber_g * entry.exchange_quantity,
    }),
    { calories: 0, carbs_g: 0, protein_g: 0, fat_g: 0, fiber_g: 0 }
  )

  // Calculate plan targets
  const planTargets = plan.meal_slots
    .flatMap((s) => s.meal_slot_requirements)
    .reduce(
      (acc, req) => {
        // Approximate: each exchange provides nominal macros based on category
        // We use representative values per exchange
        return acc
      },
      { calories: 0, carbs_g: 0, protein_g: 0, fat_g: 0 }
    )

  // Add food entry
  const handleAddEntry = async (
    slotId: string,
    reqId: string,
    foodId: string,
    quantity: number
  ) => {
    try {
      const res = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_date: selectedDate,
          plan_id: plan.id,
          meal_slot_id: slotId,
          requirement_id: reqId,
          food_id: foodId,
          exchange_quantity: quantity,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      // Refetch for simplicity
      await fetchLog(selectedDate)
      toast.success('Entrada registrada')
      setSelectionModal(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar')
    }
  }

  // Remove entry
  const handleRemoveEntry = async (entryId: string) => {
    // Optimistic
    setLogEntries((prev) => prev.filter((e) => e.id !== entryId))
    try {
      await fetch(`/api/daily-logs?entryId=${entryId}`, { method: 'DELETE' })
      toast.success('Entrada eliminada')
    } catch {
      toast.error('Error al eliminar')
      fetchLog(selectedDate)
    }
  }

  const toggleSlot = (slotId: string) => {
    setExpandedSlots((prev) => {
      const next = new Set(prev)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  const changeDate = (days: number) => {
    const current = parseISO(selectedDate)
    const newDate = days > 0 ? addDays(current, days) : subDays(current, Math.abs(days))
    setSelectedDate(format(newDate, 'yyyy-MM-dd'))
  }

  const isToday = selectedDate === getTodayString()

  return (
    <div className="space-y-6">
      {/* Date navigator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold capitalize">
            {format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <span className="text-primary font-medium">{plan.name}</span>
            {isToday && <Badge variant="secondary" className="text-xs py-0">Hoy</Badge>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)} aria-label="Día anterior">
            ‹
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(getTodayString())}
            disabled={isToday}
            className="gap-1.5 text-xs"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeDate(1)}
            disabled={isToday}
            aria-label="Día siguiente"
          >
            ›
          </Button>
        </div>
      </div>

      {/* Macro summary bar */}
      <MacroSummaryBar totals={totals} loading={logLoading} />

      {/* Meal slots */}
      {logLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {plan.meal_slots.map((slot) => {
            const isExpanded = expandedSlots.has(slot.id)

            // Is slot complete?
            const slotComplete = slot.meal_slot_requirements.every((req) => {
              const consumed = getConsumedCount(slot.id, req.id)
              return consumed >= req.exchange_count
            })

            return (
              <div
                key={slot.id}
                className={cn(
                  'rounded-2xl border bg-card overflow-hidden slot-card',
                  slotComplete && 'border-primary/40'
                )}
              >
                {/* Slot header */}
                <button
                  className="flex items-center gap-3 w-full px-5 py-4 text-left"
                  onClick={() => toggleSlot(slot.id)}
                  id={`slot-toggle-${slot.id}`}
                >
                  {/* Completion indicator */}
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full shrink-0 transition-colors',
                      slotComplete ? 'bg-primary' : 'bg-border'
                    )}
                  />

                  <span className="font-semibold flex-1">{slot.name}</span>

                  {/* Slot macro summary (collapsed) */}
                  {!isExpanded && (
                    <span className="text-xs text-muted-foreground">
                      {slot.meal_slot_requirements.length} tipo{slot.meal_slot_requirements.length !== 1 ? 's' : ''}
                    </span>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded requirements */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border">
                    {slot.meal_slot_requirements.map((req) => {
                      const consumed = getConsumedCount(slot.id, req.id)
                      const entries = getReqEntries(slot.id, req.id)
                      const progress = Math.min(100, (consumed / req.exchange_count) * 100)
                      const isComplete = consumed >= req.exchange_count

                      return (
                        <div key={req.id} className="pt-3 space-y-2">
                          {/* Requirement header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{req.food_categories.icon}</span>
                              <span className="font-medium text-sm">{req.food_categories.name}</span>
                              <Badge
                                variant="outline"
                                className={cn('text-xs py-0 transition-colors', isComplete && 'border-primary text-primary')}
                              >
                                {round(consumed)}/{req.exchange_count}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant={isComplete ? 'outline' : 'default'}
                              className={cn(
                                'gap-1 text-xs h-7',
                                !isComplete && 'brand-gradient text-white hover:opacity-90'
                              )}
                              onClick={() => setSelectionModal({ slot, requirement: req })}
                              id={`add-food-${slot.id}-${req.id}`}
                            >
                              <Plus className="w-3 h-3" />
                              {isComplete ? 'Agregar más' : 'Seleccionar'}
                            </Button>
                          </div>

                          {/* Progress bar */}
                          <Progress
                            value={progress}
                            className="h-1.5"
                            style={{ '--progress-color': req.food_categories.color_hex } as React.CSSProperties}
                          />

                          {/* Selected entries */}
                          {entries.length > 0 && (
                            <div className="space-y-1.5 mt-2">
                              {entries.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/50 text-sm"
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium truncate block">{entry.food_exchanges.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {entry.exchange_quantity}× {entry.food_exchanges.portion_amount}
                                      {' · '}
                                      <span className="text-primary font-medium">
                                        {round(entry.food_exchanges.calories * entry.exchange_quantity)} kcal
                                      </span>
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveEntry(entry.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
                                    aria-label="Eliminar entrada"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Food selection modal */}
      {selectionModal && (
        <FoodSelectionModal
          slot={selectionModal.slot}
          requirement={selectionModal.requirement}
          onClose={() => setSelectionModal(null)}
          onAdd={handleAddEntry}
        />
      )}
    </div>
  )
}
