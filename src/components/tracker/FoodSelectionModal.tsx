'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, round } from '@/lib/utils'
import type { FoodCategory } from '@/types'

interface Requirement {
  id: string
  category_id: string
  exchange_count: number
  food_categories: FoodCategory
}

interface MealSlot {
  id: string
  name: string
}

interface ActiveFood {
  id: string
  name: string
  portion_amount: string
  calories: number
  carbs_g: number
  protein_g: number
  fat_g: number
  food_categories: FoodCategory
}

interface FoodSelectionModalProps {
  slot: MealSlot
  requirement: Requirement
  onClose: () => void
  onAdd: (slotId: string, reqId: string, foodId: string, quantity: number) => Promise<void>
}

export function FoodSelectionModal({ slot, requirement, onClose, onAdd }: FoodSelectionModalProps) {
  const [foods, setFoods] = useState<ActiveFood[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ActiveFood | null>(null)
  const [quantity, setQuantity] = useState<string>('1')
  const [saving, setSaving] = useState(false)

  const cat = requirement.food_categories

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/foods/active?categoryId=${requirement.category_id}`)
        const json = await res.json()
        if (res.ok) setFoods(json.data || [])
      } catch {
        setFoods([])
      } finally {
        setLoading(false)
      }
    }
    fetchFoods()
  }, [requirement.category_id])

  const filtered = foods.filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleConfirm = async () => {
    if (!selected) return
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) return

    setSaving(true)
    await onAdd(slot.id, requirement.id, selected.id, qty)
    setSaving(false)
  }

  const parsedQty = parseFloat(quantity) || 0

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <Badge variant="outline" className="text-xs ml-auto" style={{ borderColor: cat.color_hex + '60', color: cat.color_hex }}>
              {slot.name}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Selecciona un alimento activo de esta categoría
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="food-modal-search"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Food list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              {search ? 'No se encontraron alimentos' : 'No hay alimentos activos en esta categoría'}
            </p>
          )}
          <div className="space-y-1.5">
            {filtered.map((food) => {
              const isSelected = selected?.id === food.id
              return (
                <button
                  key={food.id}
                  onClick={() => setSelected(isSelected ? null : food)}
                  className={cn(
                    'w-full text-left rounded-xl px-3 py-2.5 border transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                  id={`food-option-${food.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm leading-snug">{food.name}</p>
                      <p className="text-xs text-muted-foreground">{food.portion_amount}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-primary">{food.calories} kcal</p>
                      <p className="text-xs text-muted-foreground">
                        C{food.carbs_g}g · P{food.protein_g}g · G{food.fat_g}g
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer: quantity + confirm */}
        <div className="px-4 py-4 border-t border-border shrink-0 space-y-3">
          {selected && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selected.name}</p>
                <p className="text-xs text-muted-foreground">
                  {parsedQty > 0
                    ? `${round(selected.calories * parsedQty)} kcal · C${round(selected.carbs_g * parsedQty)}g · P${round(selected.protein_g * parsedQty)}g`
                    : 'Ingresa cantidad'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((v) => String(Math.max(0.5, parseFloat(v) - 0.5)))}
                >
                  –
                </Button>
                <Input
                  id="food-quantity-input"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-16 text-center h-8"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((v) => String(parseFloat(v) + 0.5))}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className="flex-1 brand-gradient text-white hover:opacity-90"
              disabled={!selected || parsedQty <= 0 || saving}
              onClick={handleConfirm}
              id="confirm-food-selection-btn"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Agregar al registro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
