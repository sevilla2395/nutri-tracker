'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Pencil, Loader2 } from 'lucide-react'
import * as z from 'zod'

import type { FoodCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  icon: z.string().min(1, 'Se requiere un icono'),
  color_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Debe ser un código Hex válido'),
})

type CategoryInput = z.infer<typeof categorySchema>

interface CategoriesClientProps {
  initialCategories: FoodCategory[]
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingCategory, setEditingCategory] = useState<FoodCategory | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  })

  const handleEdit = (category: FoodCategory) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      icon: category.icon,
      color_hex: category.color_hex,
    })
  }

  const onSubmit = async (data: CategoryInput) => {
    if (!editingCategory) return
    setLoading(true)

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...data } : c))
      )
      toast.success(`Categoría "${data.name}" actualizada para todos`)
      setEditingCategory(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorías de Alimentos</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Administra las categorías globales (estas aplican para todos los usuarios)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-4 rounded-xl border bg-card transition-all slot-card"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${cat.color_hex}20` }}
              >
                {cat.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                  <Badge variant="outline" style={{ color: cat.color_hex, borderColor: cat.color_hex + '60' }}>
                    {cat.color_hex}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(cat)}
              className="text-muted-foreground hover:text-primary"
              aria-label={`Editar categoría ${cat.name}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Modifica el nombre, icono o color. Los cambios afectarán a todos los usuarios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre de la categoría</Label>
              <Input
                id="cat-name"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-icon">Icono (Emoji)</Label>
                <Input
                  id="cat-icon"
                  {...register('icon')}
                  className={errors.icon ? 'border-destructive' : ''}
                />
                {errors.icon && <p className="text-xs text-destructive">{errors.icon.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-color">Color Hex</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cat-color"
                    type="color"
                    className="w-12 h-10 p-1 cursor-pointer rounded-md border"
                    {...register('color_hex')}
                  />
                  <Input
                    {...register('color_hex')}
                    placeholder="#000000"
                    className={errors.color_hex ? 'border-destructive' : ''}
                  />
                </div>
                {errors.color_hex && <p className="text-xs text-destructive">{errors.color_hex.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingCategory(null)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 brand-gradient text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
