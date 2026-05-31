import { useState, useEffect } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Textarea } from '../../ui/Textarea'
import type { Material, MaterialType, SellingFormat } from '../../domain/materials'
import {
  MATERIAL_TYPE_LABELS,
  SELLING_FORMAT_LABELS,
  defaultFormValues,
  materialToFormValues,
  validateForm,
  poundsInputToPence,
  priceUnitForFormat,
  type MaterialFormValues,
} from './materialHelpers'

interface Props {
  open: boolean
  editing?: Material
  onClose: () => void
  onSave: (data: Omit<Material, 'id'>) => Promise<void>
}

const TYPE_OPTIONS = (Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[]).map(k => ({
  value: k,
  label: MATERIAL_TYPE_LABELS[k],
}))

const FORMAT_OPTIONS = (Object.keys(SELLING_FORMAT_LABELS) as SellingFormat[]).map(k => ({
  value: k,
  label: SELLING_FORMAT_LABELS[k],
}))

export function MaterialForm({ open, editing, onClose, onSave }: Props) {
  const [values, setValues] = useState<MaterialFormValues>(() =>
    editing ? materialToFormValues(editing) : defaultFormValues(),
  )
  const [errors, setErrors] = useState<ReturnType<typeof validateForm>>({})
  const [saving, setSaving] = useState(false)

  // Reset form each time the dialog opens or the editing target changes
  useEffect(() => {
    if (open) {
      setValues(editing ? materialToFormValues(editing) : defaultFormValues())
      setErrors({})
    }
  }, [open, editing])

  function set(field: keyof MaterialFormValues, value: string) {
    setValues(v => ({ ...v, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit() {
    const errs = validateForm(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      const data: Omit<Material, 'id'> = {
        make: values.make.trim(),
        range: values.range.trim(),
        sku: values.sku.trim(),
        type: values.type,
        sellingFormat: values.sellingFormat,
        unitPricePence: poundsInputToPence(values.unitPricePounds),
        priceUnit: priceUnitForFormat(values.sellingFormat),
        ...(values.sellingFormat === 'roll' && {
          rollWidthMm: Math.round(parseFloat(values.rollWidthM) * 1000),
        }),
        ...(values.sellingFormat === 'pack' && {
          coveragePerPackM2: parseFloat(values.coveragePerPackM2),
        }),
        ...(values.supplier.trim() && { supplier: values.supplier.trim() }),
        ...(values.notes.trim() && { notes: values.notes.trim() }),
      }
      await onSave(data)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={editing ? 'Edit material' : 'Add material'}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add material'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Type + Format row */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={values.type}
            onChange={e => set('type', e.target.value)}
          />
          <Select
            label="Selling format"
            options={FORMAT_OPTIONS}
            value={values.sellingFormat}
            onChange={e => set('sellingFormat', e.target.value)}
          />
        </div>

        {/* Manufacturer + Range */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Make / manufacturer"
            value={values.make}
            onChange={e => set('make', e.target.value)}
            error={errors.make}
            placeholder="e.g. Cormar"
          />
          <Input
            label="Range / product name"
            value={values.range}
            onChange={e => set('range', e.target.value)}
            error={errors.range}
            placeholder="e.g. Sensation"
          />
        </div>

        {/* SKU + Supplier */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="SKU / reference"
            value={values.sku}
            onChange={e => set('sku', e.target.value)}
            placeholder="e.g. SEN-BEI-4M"
          />
          <Input
            label="Supplier"
            value={values.supplier}
            onChange={e => set('supplier', e.target.value)}
            placeholder="e.g. Tapi"
          />
        </div>

        {/* Format-specific fields */}
        {values.sellingFormat === 'roll' && (
          <Input
            label="Roll width (metres)"
            type="number"
            step="0.1"
            min="0.1"
            value={values.rollWidthM}
            onChange={e => set('rollWidthM', e.target.value)}
            error={errors.rollWidthM}
            hint="Standard widths: 3m, 4m, 5m"
          />
        )}
        {values.sellingFormat === 'pack' && (
          <Input
            label="Coverage per pack (m²)"
            type="number"
            step="0.01"
            min="0.01"
            value={values.coveragePerPackM2}
            onChange={e => set('coveragePerPackM2', e.target.value)}
            error={errors.coveragePerPackM2}
            hint="Check the pack label — typically 1.5 – 3.0 m²"
          />
        )}

        {/* Price */}
        <Input
          label={`Price (£) — ${
            values.sellingFormat === 'roll' ? 'per linear metre' :
            values.sellingFormat === 'pack' ? 'per pack' :
            values.sellingFormat === 'area' ? 'per m²' :
            values.sellingFormat === 'linear' ? 'per metre' : 'per unit'
          }`}
          type="number"
          step="0.01"
          min="0"
          value={values.unitPricePounds}
          onChange={e => set('unitPricePounds', e.target.value)}
          error={errors.unitPricePounds}
          placeholder="0.00"
        />

        {/* Notes */}
        <Textarea
          label="Notes"
          value={values.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Colour, finish, any extra details…"
        />
      </div>
    </Modal>
  )
}
