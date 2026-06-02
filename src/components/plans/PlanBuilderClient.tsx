'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Plus, Trash2, Loader2, ArrowLeft, GripVertical, X, ChevronDown, ChevronUp
} from 'lucide-react'

import type { FoodCategory } from '@/types'
import {
  mealSlotSchema, mealSlotRequirementSchema,
  type MealSlotInput, type MealSlotRequirementInput
} from '@/lib/validations/plan.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Requirement {
  id: string
  meal_slot_id: string
  category_id: string
  exchange_count: number
  food_categories: FoodCategory
}

interface MealSlot {
  id: string
  plan_id: string
  name: string
  display_order: number
  meal_slot_requirements: Requirement[]
}

interface Plan {
  id: string
  name: string
  description: string | null
  is_active: boolean
  meal_slots: MealSlot[]
}

interface PlanBuilderClientProps {
  plan: Plan
  categories: FoodCategory[]
}

export function PlanBuilderClient({ plan, categories }: PlanBuilderClientProps) {
  const router = useRouter()
  const [slots, setSlots] = useState<MealSlot[]>(plan.meal_slots)
  const [expandedSlot, setExpandedSlot] = useState<string | null>(
    plan.meal_slots[0]?.id ?? null
  )
  const [addingSlot, setAddingSlot] = useState(false)
  const [savingSlot, setSavingSlot] = useState(false)
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null)
  const [savingReq, setSavingReq] = useState<string | null>(null) // slotId

  // Slot creation form
  const { register: regSlot, handleSubmit: hsSlot, reset: resetSlot, formState: { errors: errSlot } } =
    useForm<MealSlotInput>({ resolver: zodResolver(mealSlotSchema) })

  // Requirement form state per slot
  const [reqForms, setReqForms] = useState<
    Record<string, { category_id: string; exchange_count: string }>
  >({})

  const createSlot = async (data: MealSlotInput) => {
    setSavingSlot(true)
    try {
      const res = await fetch(`/api/plans/${plan.id}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const newSlot: MealSlot = { ...json.data, meal_slot_requirements: [] }
      setSlots((prev) => [...prev, newSlot])
      setExpandedSlot(newSlot.id)
      toast.success(`"${data.name}" agregado`)
      resetSlot()
      setAddingSlot(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear tiempo de comida')
    } finally {
      setSavingSlot(false)
    }
  }

  const deleteSlot = async (slotId: string, slotName: string) => {
    if (!confirm(`¿Eliminar "${slotName}" y todos sus requerimientos?`)) return
    setDeletingSlotId(slotId)
    try {
      await fetch(`/api/plans/${plan.id}/slots/${slotId}`, { method: 'DELETE' })
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
      toast.success(`"${slotName}" eliminado`)
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeletingSlotId(null)
    }
  }

  const addRequirement = async (slotId: string) => {
    const form = reqForms[slotId]
    if (!form?.category_id || !form?.exchange_count) {
      toast.error('Selecciona una categoría e indica la cantidad')
      return
    }

    const parsed = mealSlotRequirementSchema.safeParse({
      category_id: form.category_id,
      exchange_count: parseFloat(form.exchange_count),
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    setSavingReq(slotId)
    try {
      const res = await fetch(`/api/plans/${plan.id}/slots/${slotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const cat = categories.find((c) => c.id === parsed.data.category_id)!
      const newReq: Requirement = { ...json.data, food_categories: cat }

      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? {
                ...s,
                meal_slot_requirements: [
                  ...s.meal_slot_requirements.filter(
                    (r) => r.category_id !== parsed.data.category_id
                  ),
                  newReq,
                ],
              }
            : s
        )
      )
      setReqForms((prev) => ({ ...prev, [slotId]: { category_id: '', exchange_count: '' } }))
      toast.success('Requerimiento guardado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingReq(null)
    }
  }

  const removeRequirement = async (slotId: string, reqId: string, reqName: string) => {
    // Optimistic
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, meal_slot_requirements: s.meal_slot_requirements.filter((r) => r.id !== reqId) }
          : s
      )
    )
    try {
      await fetch(`/api/plans/${plan.id}/slots/${slotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delete_requirement_id: reqId }),
      })
      toast.success(`"${reqName}" eliminado`)
    } catch {
      toast.error('Error al eliminar requerimiento')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{plan.name}</h2>
          {plan.description && (
            <p className="text-muted-foreground text-sm">{plan.description}</p>
          )}
        </div>
        {plan.is_active && (
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">
            ⭐ Plan activo
          </Badge>
        )}
      </div>

      {/* Slots */}
      <div className="space-y-3">
        {slots.length === 0 && !addingSlot && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
            <p className="text-base font-medium">Sin tiempos de comida</p>
            <p className="text-sm mt-1">Agrega tu primer tiempo de comida abajo</p>
          </div>
        )}

        {slots.map((slot) => {
          const isExpanded = expandedSlot === slot.id
          const form = reqForms[slot.id] ?? { category_id: '', exchange_count: '' }

          // Determine which categories are not yet added
          const usedCatIds = slot.meal_slot_requirements.map((r) => r.category_id)
          const availableCategories = categories.filter((c) => !usedCatIds.includes(c.id))

          return (
            <div key={slot.id} className="rounded-2xl border bg-card overflow-hidden slot-card">
              {/* Slot header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <button
                  className="flex-1 text-left font-semibold text-sm"
                  onClick={() => setExpandedSlot(isExpanded ? null : slot.id)}
                >
                  {slot.name}
                </button>

                {/* Requirement badges preview */}
                {!isExpanded && slot.meal_slot_requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {slot.meal_slot_requirements.map((r) => (
                      <Badge
                        key={r.id}
                        variant="outline"
                        className="text-xs py-0"
                        style={{ borderColor: r.food_categories.color_hex + '60', color: r.food_categories.color_hex }}
                      >
                        {r.exchange_count}× {r.food_categories.icon}
                      </Badge>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setExpandedSlot(isExpanded ? null : slot.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => deleteSlot(slot.id, slot.name)}
                  disabled={deletingSlotId === slot.id}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Eliminar tiempo de comida"
                >
                  {deletingSlotId === slot.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
                  {/* Current requirements */}
                  {slot.meal_slot_requirements.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Requerimientos
                      </p>
                      {slot.meal_slot_requirements.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-xl px-3 py-2"
                          style={{ backgroundColor: req.food_categories.color_hex + '15' }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{req.food_categories.icon}</span>
                            <span className="font-medium text-sm">{req.food_categories.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: req.food_categories.color_hex }}>
                              {req.exchange_count} {req.exchange_count === 1 ? 'intercambio' : 'intercambios'}
                            </span>
                            <button
                              onClick={() => removeRequirement(slot.id, req.id, req.food_categories.name)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Eliminar requerimiento"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add requirement form */}
                  {availableCategories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Agregar requerimiento
                      </p>
                      <div className="flex gap-2">
                        <Select
                          value={form.category_id}
                          onValueChange={(v) =>
                            setReqForms((prev) => ({
                              ...prev,
                              [slot.id]: { ...form, category_id: v ?? '' },
                            }))
                          }
                        >
                          <SelectTrigger className="flex-1" id={`cat-select-${slot.id}`}>
                            <SelectValue placeholder="Categoría..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          id={`count-input-${slot.id}`}
                          type="number"
                          min="0.5"
                          step="0.5"
                          placeholder="Cant."
                          value={form.exchange_count}
                          onChange={(e) =>
                            setReqForms((prev) => ({
                              ...prev,
                              [slot.id]: { ...form, exchange_count: e.target.value },
                            }))
                          }
                          className="w-24"
                        />

                        <Button
                          onClick={() => addRequirement(slot.id)}
                          disabled={savingReq === slot.id}
                          size="sm"
                          className="brand-gradient text-white hover:opacity-90"
                          id={`add-req-${slot.id}`}
                        >
                          {savingReq === slot.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {slot.meal_slot_requirements.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Sin requerimientos aún. Selecciona una categoría y cantidad arriba.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Add slot form */}
        {addingSlot ? (
          <div className="rounded-2xl border-2 border-primary/30 bg-card p-4">
            <form onSubmit={hsSlot(createSlot)} className="flex gap-2">
              <Input
                id="new-slot-name"
                placeholder="Ej. Desayuno, Almuerzo, Merienda..."
                {...regSlot('name')}
                className={cn('flex-1', errSlot.name ? 'border-destructive' : '')}
                autoFocus
              />
              <Button
                type="submit"
                className="brand-gradient text-white hover:opacity-90"
                disabled={savingSlot}
                id="save-slot-btn"
              >
                {savingSlot ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setAddingSlot(false)}>
                <X className="w-4 h-4" />
              </Button>
            </form>
            {errSlot.name && (
              <p className="text-xs text-destructive mt-1 px-1">{errSlot.name.message}</p>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full rounded-2xl border-dashed gap-2 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            onClick={() => setAddingSlot(true)}
            id="add-slot-btn"
          >
            <Plus className="w-4 h-4" />
            Agregar tiempo de comida
          </Button>
        )}
      </div>
    </div>
  )
}
