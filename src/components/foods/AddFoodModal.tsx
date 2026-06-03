'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { foodExchangeSchema, type FoodExchangeInput } from '@/lib/validations/food.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FoodCategory } from '@/types'

interface AddFoodModalProps {
  categories: FoodCategory[]
  initialData?: any | null
  onClose: () => void
  onAdded: (food: any) => void
}

export function AddFoodModal({ categories, initialData, onClose, onAdded }: AddFoodModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FoodExchangeInput>({
    resolver: zodResolver(foodExchangeSchema),
    defaultValues: {
      category_id: initialData?.category_id || '',
      name: initialData?.name || '',
      portion_amount: initialData?.portion_amount || '',
      portion_grams: initialData?.portion_grams || null,
      calories: initialData?.calories || 0,
      carbs_g: initialData?.carbs_g || 0,
      protein_g: initialData?.protein_g || 0,
      fat_g: initialData?.fat_g || 0,
      fiber_g: initialData?.fiber_g || 0,
    }
  })

  const selectedCategory = watch('category_id')

  const onSubmit = async (data: FoodExchangeInput) => {
    setLoading(true)
    try {
      const url = initialData ? `/api/foods/${initialData.id}` : '/api/foods'
      const method = initialData ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar')

      // Attach category data for display
      const cat = categories.find((c) => c.id === data.category_id)
      onAdded({ ...json.data, food_categories: cat, user_food_preferences: [] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear alimento')
    } finally {
      setLoading(false)
    }
  }



  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar alimento' : 'Agregar alimento personalizado'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Modifica los detalles del alimento' : 'Define la porción y los valores nutricionales por intercambio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="modal-category">Categoría *</Label>
            <Select
              onValueChange={(v) => setValue('category_id', v ?? '')}
              value={selectedCategory}
            >
              <SelectTrigger id="modal-category" className={errors.category_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar categoría..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      {cat.icon} {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-xs text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="modal-name">Nombre del alimento *</Label>
            <Input
              id="modal-name"
              placeholder="Ej. Arroz integral"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Portion */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-portion">Porción *</Label>
              <Input
                id="modal-portion"
                placeholder="Ej. 1/2 taza"
                {...register('portion_amount')}
                className={errors.portion_amount ? 'border-destructive' : ''}
              />
              {errors.portion_amount && (
                <p className="text-xs text-destructive">{errors.portion_amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-grams">Peso en gramos</Label>
              <Input
                id="modal-grams"
                type="number"
                step="0.1"
                min="0"
                placeholder="Opcional"
                {...register('portion_grams', { valueAsNumber: true })}
              />
            </div>
          </div>



          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 brand-gradient text-white hover:opacity-90"
              disabled={loading}
              id="add-food-submit-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? 'Guardar cambios' : 'Guardar alimento')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
