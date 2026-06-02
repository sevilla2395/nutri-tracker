'use client'

import { round } from '@/lib/utils'
import type { NutritionTotals } from '@/types'
import { Flame, Wheat, Beef, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MacroSummaryBarProps {
  totals: NutritionTotals
  loading?: boolean
}

interface MacroCardProps {
  label: string
  value: number
  unit: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
  max?: number
}

function MacroCard({ label, value, unit, icon: Icon, colorClass, bgClass, max }: MacroCardProps) {
  const pct = max ? Math.min(100, (value / max) * 100) : null

  return (
    <div className={cn('rounded-2xl p-4 flex flex-col gap-2', bgClass)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', colorClass)} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
        </div>
      </div>
      <div>
        <span className={cn('text-2xl font-bold', colorClass)}>{round(value)}</span>
        <span className="text-sm text-muted-foreground ml-1">{unit}</span>
      </div>
      {pct !== null && (
        <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colorClass.replace('text-', 'bg-'))}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function MacroSummaryBar({ totals, loading }: MacroSummaryBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-muted animate-pulse h-24" />
        ))}
      </div>
    )
  }

  const macros: MacroCardProps[] = [
    {
      label: 'Calorías',
      value: totals.calories,
      unit: 'kcal',
      icon: Flame,
      colorClass: 'text-orange-500',
      bgClass: 'bg-orange-500/10',
    },
    {
      label: 'Carbohidratos',
      value: totals.carbs_g,
      unit: 'g',
      icon: Wheat,
      colorClass: 'macro-carbs',
      bgClass: 'macro-carbs-bg',
    },
    {
      label: 'Proteínas',
      value: totals.protein_g,
      unit: 'g',
      icon: Beef,
      colorClass: 'macro-protein',
      bgClass: 'macro-protein-bg',
    },
    {
      label: 'Grasas',
      value: totals.fat_g,
      unit: 'g',
      icon: Droplets,
      colorClass: 'macro-fat',
      bgClass: 'macro-fat-bg',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {macros.map((m) => (
        <MacroCard key={m.label} {...m} />
      ))}
    </div>
  )
}
