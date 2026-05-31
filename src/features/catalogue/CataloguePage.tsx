import { useState, useEffect, useCallback } from 'react'
import { materialsRepo } from '../../data'
import type { Material } from '../../domain/materials'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { EmptyState } from '../../ui/EmptyState'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { MaterialForm } from './MaterialForm'
import {
  MATERIAL_TYPE_LABELS,
  SELLING_FORMAT_LABELS,
  TYPE_COLORS,
  FORMAT_COLORS,
  penceToPoundsInput,
} from './materialHelpers'
import type { MaterialType } from '../../domain/materials'

const ALL = 'all' as const
const TYPE_FILTER_OPTIONS: Array<{ value: typeof ALL | MaterialType; label: string }> = [
  { value: 'all', label: 'All types' },
  ...Object.entries(MATERIAL_TYPE_LABELS).map(([k, v]) => ({ value: k as MaterialType, label: v })),
]

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function PackageIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function formatPrice(m: Material): string {
  const pounds = penceToPoundsInput(m.unitPricePence)
  const unit =
    m.sellingFormat === 'roll'   ? '/lin m' :
    m.sellingFormat === 'pack'   ? '/pack' :
    m.sellingFormat === 'area'   ? '/m²' :
    m.sellingFormat === 'linear' ? '/m' : '/unit'
  return `£${pounds}${unit}`
}

function formatDetail(m: Material): string | null {
  if (m.sellingFormat === 'roll' && m.rollWidthMm != null) {
    return `${m.rollWidthMm / 1000}m wide roll`
  }
  if (m.sellingFormat === 'pack' && m.coveragePerPackM2 != null) {
    return `${m.coveragePerPackM2.toFixed(2)} m²/pack`
  }
  return null
}

export function CataloguePage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [typeFilter, setTypeFilter] = useState<typeof ALL | MaterialType>('all')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Material | undefined>()
  const [deleting, setDeleting] = useState<Material | undefined>()

  const load = useCallback(async () => {
    const all = await materialsRepo.getAll()
    setMaterials(all)
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = materials.filter(m => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        m.make.toLowerCase().includes(q) ||
        m.range.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        (m.supplier ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  async function handleSave(data: Omit<Material, 'id'>) {
    if (editing) {
      await materialsRepo.update(editing.id, data)
    } else {
      await materialsRepo.create(data)
    }
    await load()
  }

  async function handleDelete() {
    if (!deleting) return
    await materialsRepo.delete(deleting.id)
    setDeleting(undefined)
    await load()
  }

  function openAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(m: Material) {
    setEditing(m)
    setFormOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Materials catalogue</h1>
          <p className="text-sm text-gray-500 mt-0.5">{materials.length} item{materials.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon /> Add material
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search make, range, SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] sm:w-40"
        >
          {TYPE_FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageIcon />}
          title={materials.length === 0 ? 'No materials yet' : 'No results'}
          description={
            materials.length === 0
              ? 'Add your first material to start building quotes.'
              : 'Try a different search or filter.'
          }
          action={materials.length === 0 ? <Button onClick={openAdd}><PlusIcon /> Add material</Button> : undefined}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map(m => {
            const detail = formatDetail(m)
            return (
              <li
                key={m.id}
                className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-start gap-3 hover:border-gray-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {m.make} — {m.range}
                    </span>
                    <Badge color={TYPE_COLORS[m.type]}>{MATERIAL_TYPE_LABELS[m.type]}</Badge>
                    <Badge color={FORMAT_COLORS[m.sellingFormat]}>{SELLING_FORMAT_LABELS[m.sellingFormat]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {m.sku && <span className="text-xs text-gray-400">{m.sku}</span>}
                    {m.supplier && <span className="text-xs text-gray-400">{m.supplier}</span>}
                    {detail && <span className="text-xs text-gray-500">{detail}</span>}
                    <span className="text-sm font-semibold text-[var(--color-brand)]">{formatPrice(m)}</span>
                  </div>
                  {m.notes && <p className="text-xs text-gray-500 mt-1 truncate">{m.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(m)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleting(m)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <MaterialForm
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete material"
        message={`Remove "${deleting?.make} — ${deleting?.range}" from the catalogue? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(undefined)}
      />
    </div>
  )
}
