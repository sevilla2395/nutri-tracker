'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { AddFoodModal } from './AddFoodModal'
import type { FoodCategory } from '@/types'
import { cn } from '@/lib/utils'

interface FoodWithPrefs {
  id: string
  name: string
  portion_amount: string
  calories: number
  carbs_g: number
  protein_g: number
  fat_g: number
  fiber_g: number
  is_global: boolean
  created_by: string | null
  category_id: string
  food_categories: FoodCategory
  user_food_preferences?: Array<{ is_active: boolean }>
}

interface FoodsClientProps {
  initialFoods: FoodWithPrefs[]
  categories: FoodCategory[]
}

export function FoodsClient({ initialFoods, categories }: FoodsClientProps) {
  const [foods, setFoods] = useState(initialFoods)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodWithPrefs | null>(null)

  // Determine active state: check user_food_preferences first, default true
  const isActive = (food: FoodWithPrefs) => {
    const pref = food.user_food_preferences?.[0]
    return pref !== undefined ? pref.is_active : true
  }

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      const matchCat = !selectedCategory || f.category_id === selectedCategory
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [foods, selectedCategory, search])

  const handleToggle = async (food: FoodWithPrefs, active: boolean) => {
    // Optimistic update
    setFoods((prev) =>
      prev.map((f) =>
        f.id === food.id
          ? { ...f, user_food_preferences: [{ is_active: active }] }
          : f
      )
    )

    try {
      const res = await fetch('/api/foods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_id: food.id, is_active: active }),
      })
      if (!res.ok) throw new Error()
      toast.success(active ? `"${food.name}" activado` : `"${food.name}" desactivado`)
    } catch {
      // Revert
      setFoods((prev) =>
        prev.map((f) =>
          f.id === food.id
            ? { ...f, user_food_preferences: [{ is_active: !active }] }
            : f
        )
      )
      toast.error('Error al actualizar preferencia')
    }
  }

  const handleDelete = async (food: FoodWithPrefs) => {
    if (!confirm(`¿Eliminar "${food.name}"?`)) return

    setFoods((prev) => prev.filter((f) => f.id !== food.id))
    try {
      const res = await fetch(`/api/foods?id=${food.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(`"${food.name}" eliminado`)
    } catch {
      setFoods((prev) => [...prev, food])
      toast.error('Error al eliminar alimento')
    }
  }

  const handleFoodAdded = (newFood: FoodWithPrefs) => {
    setFoods((prev) => [newFood, ...prev])
    toast.success(`"${newFood.name}" agregado`)
    setShowAddModal(false)
  }

  const handleFoodUpdated = (updatedFood: FoodWithPrefs) => {
    setFoods((prev) => prev.map((f) => (f.id === updatedFood.id ? updatedFood : f)))
    toast.success(`"${updatedFood.name}" actualizado`)
    setEditingFood(null)
  }

  // Count active foods per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    foods.forEach((f) => {
      if (!counts[f.category_id]) counts[f.category_id] = 0
      counts[f.category_id]++
    })
    return counts
  }, [foods])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Alimentos</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {foods.length} alimentos • Activa/desactiva los que consumes
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="brand-gradient text-white shadow-md shadow-primary/30 hover:opacity-90 gap-2"
          id="add-food-btn"
        >
          <Plus className="w-4 h-4" />
          Agregar alimento
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
            !selectedCategory
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Todos
          <span className="text-xs opacity-70">({foods.length})</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              selectedCategory === cat.id
                ? 'text-white shadow-sm'
                : 'bg-card text-foreground hover:bg-muted border-border'
            )}
            style={
              selectedCategory === cat.id
                ? { backgroundColor: cat.color_hex, borderColor: cat.color_hex }
                : { borderColor: cat.color_hex + '40' }
            }
          >
            <span>{cat.icon}</span>
            {cat.name}
            <span className="text-xs opacity-70">({categoryCounts[cat.id] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="food-search"
          placeholder="Buscar alimentos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Food list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <span className="text-4xl block mb-3">🍽️</span>
            <p className="font-medium">No se encontraron alimentos</p>
            <p className="text-sm mt-1">Prueba con otra búsqueda o categoría</p>
          </div>
        )}

        {filtered.map((food) => {
          const active = isActive(food)
          const catColor = food.food_categories?.color_hex || '#ccc'

          return (
            <div
              key={food.id}
              className={cn(
                'rounded-xl border bg-card transition-all duration-200 overflow-hidden slot-card',
                !active && 'opacity-55'
              )}
            >
              <div className="flex items-center gap-3 p-3 pr-4">
                {/* Category dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: catColor }}
                />

                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('font-medium text-sm', !active && 'line-through text-muted-foreground')}>
                      {food.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs py-0 px-1.5"
                      style={{ borderColor: catColor + '60', color: catColor }}
                    >
                      {food.food_categories?.icon} {food.food_categories?.name || 'Desconocido'}
                    </Badge>
                    {!food.is_global && (
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">
                        Personalizado
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{food.portion_amount}</span>
                </div>

                {/* Active toggle */}
                <Switch
                  id={`toggle-${food.id}`}
                  checked={active}
                  onCheckedChange={(v) => handleToggle(food, v)}
                  aria-label={active ? 'Desactivar alimento' : 'Activar alimento'}
                />

                <button
                  onClick={() => setEditingFood(food)}
                  className="text-muted-foreground hover:text-primary transition-colors ml-1"
                  aria-label="Editar alimento"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(food)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  aria-label="Eliminar alimento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Food Modal */}
      {(showAddModal || editingFood) && (
        <AddFoodModal
          categories={categories}
          initialData={editingFood}
          onClose={() => {
            setShowAddModal(false)
            setEditingFood(null)
          }}
          onAdded={editingFood ? handleFoodUpdated : handleFoodAdded}
        />
      )}
    </div>
  )
}
