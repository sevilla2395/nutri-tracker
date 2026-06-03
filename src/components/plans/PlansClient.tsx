'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Plus, Star, Trash2, ChevronRight, Loader2, ClipboardList, Pencil, Settings
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import type { PlanTemplate } from '@/types'
import { planTemplateSchema, type PlanTemplateInput } from '@/lib/validations/plan.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PlansClientProps {
  initialPlans: PlanTemplate[]
}

export function PlansClient({ initialPlans }: PlansClientProps) {
  const router = useRouter()
  const [plans, setPlans] = useState(initialPlans)
  const [showCreate, setShowCreate] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlanTemplateInput>({
    resolver: zodResolver(planTemplateSchema),
  })

  const createOrEditPlan = async (data: PlanTemplateInput) => {
    setLoading(true)
    try {
      const url = editingPlan ? `/api/plans/${editingPlan.id}` : '/api/plans'
      const method = editingPlan ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      
      if (editingPlan) {
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...data } : p)))
        toast.success(`Plan "${data.name}" actualizado`)
      } else {
        setPlans((prev) => [json.data, ...prev])
        toast.success(`Plan "${data.name}" creado`)
      }
      
      reset()
      setShowCreate(false)
      setEditingPlan(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar plan')
    } finally {
      setLoading(false)
    }
  }

  const setActive = async (planId: string) => {
    setActivatingId(planId)
    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ set_active: true }),
      })
      if (!res.ok) throw new Error()
      setPlans((prev) =>
        prev.map((p) => ({ ...p, is_active: p.id === planId }))
      )
      toast.success('Plan activado para el tracker diario')
    } catch {
      toast.error('Error al activar plan')
    } finally {
      setActivatingId(null)
    }
  }

  const deletePlan = async (plan: PlanTemplate) => {
    if (!confirm(`¿Eliminar el plan "${plan.name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(plan.id)
    try {
      const res = await fetch(`/api/plans/${plan.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPlans((prev) => prev.filter((p) => p.id !== plan.id))
      toast.success(`Plan "${plan.name}" eliminado`)
    } catch {
      toast.error('Error al eliminar plan')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Planes</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {plans.length} {plans.length === 1 ? 'plan creado' : 'planes creados'}
          </p>
        </div>
        <Button
          onClick={() => {
            reset()
            setEditingPlan(null)
            setShowCreate(true)
          }}
          className="brand-gradient text-white shadow-md shadow-primary/30 hover:opacity-90 gap-2"
          id="create-plan-btn"
        >
          <Plus className="w-4 h-4" />
          Nuevo plan
        </Button>
      </div>

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin planes aún</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Crea tu primer plan de alimentación para empezar a trackear
          </p>
          <Button
            onClick={() => {
              reset()
              setEditingPlan(null)
              setShowCreate(true)
            }}
            className="brand-gradient text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear primer plan
          </Button>
        </div>
      )}

      {/* Plans list */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'rounded-2xl border bg-card p-5 transition-all slot-card',
              plan.is_active && 'border-primary/40 shadow-sm shadow-primary/10'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base">{plan.name}</h3>
                  {plan.is_active && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 py-0">
                      <Star className="w-3 h-3 fill-current" />
                      Activo
                    </Badge>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">{plan.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Creado el{' '}
                  {format(parseISO(plan.created_at), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Set as active */}
                {!plan.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActive(plan.id)}
                    disabled={!!activatingId}
                    className="gap-1.5 text-xs"
                    id={`activate-plan-${plan.id}`}
                  >
                    {activatingId === plan.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Star className="w-3 h-3" />
                    )}
                    Activar
                  </Button>
                )}

                {/* Go to builder */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/plans/${plan.id}`)}
                  className="gap-1.5 text-xs"
                  id={`edit-plan-${plan.id}`}
                >
                  <Settings className="w-3 h-3" />
                  Configurar
                  <ChevronRight className="w-3 h-3" />
                </Button>

                {/* Edit details */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingPlan(plan)
                    reset({ name: plan.name, description: plan.description || '' })
                    setShowCreate(true)
                  }}
                  className="text-muted-foreground hover:text-primary h-8 w-8"
                  id={`edit-plan-details-${plan.id}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePlan(plan)}
                  disabled={deletingId === plan.id}
                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                  id={`delete-plan-${plan.id}`}
                >
                  {deletingId === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit plan modal */}
      <Dialog open={showCreate} onOpenChange={(open) => {
        if (!open) {
          setShowCreate(false)
          setEditingPlan(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar plan' : 'Crear nuevo plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Modifica el nombre o descripción del plan' : 'Dale un nombre descriptivo, como "Pérdida de peso" o "Mantenimiento"'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(createOrEditPlan)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nombre del plan *</Label>
              <Input
                id="plan-name"
                placeholder="Ej. Plan de definición"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-desc">Descripción (opcional)</Label>
              <Textarea
                id="plan-desc"
                placeholder="Notas sobre este plan..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => {
                setShowCreate(false)
                setEditingPlan(null)
              }}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 brand-gradient text-white hover:opacity-90"
                disabled={loading}
                id="create-plan-submit-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingPlan ? 'Guardar cambios' : 'Crear plan')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
