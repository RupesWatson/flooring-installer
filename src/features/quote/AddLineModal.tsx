import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import { Input } from '../../ui/Input'
import type { Room } from '../../domain/measurement'
import { roomAreaM2, roomPerimeterMm } from '../../domain/measurement'
import type { Material, LayPattern } from '../../domain/materials'
import { MATERIAL_TYPE_LABELS } from '../catalogue/materialHelpers'
import type { BusinessSettings, QuoteLine } from '../../domain/pricing'
import {
  computeMaterialLine, computeLabourLine, computeStairLabourLine, customLine,
} from './computeLine'
import { calcLinear } from '../../domain/materials'
import { buildQuoteLine } from '../../domain/pricing'
import { newId } from '../../data/utils'

type Tab = 'material' | 'labour' | 'addons' | 'custom'

interface Props {
  open: boolean
  rooms: Room[]
  materials: Material[]
  settings: BusinessSettings
  onAdd: (line: QuoteLine) => void
  onClose: () => void
}

const LAY_OPTIONS: Array<{ value: LayPattern; label: string }> = [
  { value: 'straight', label: 'Straight (8% waste)' },
  { value: 'diagonal', label: 'Diagonal (12% waste)' },
  { value: 'herringbone', label: 'Herringbone (15% waste)' },
]

const KIND_OPTIONS: Array<{ value: QuoteLine['kind']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labour', label: 'Labour' },
  { value: 'prep', label: 'Prep / screed' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'disposal', label: 'Disposal' },
]

export function AddLineModal({ open, rooms, materials, settings, onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('material')

  // Material tab state
  const [matRoomId, setMatRoomId] = useState('')
  const [matId, setMatId] = useState('')
  const [layPattern, setLayPattern] = useState<LayPattern>('straight')
  const [unitCount, setUnitCount] = useState('1')
  const [doorDeduct, setDoorDeduct] = useState('0')

  // Labour tab state
  const [labRoomId, setLabRoomId] = useState('')
  const [labType, setLabType] = useState<'m2' | 'step' | 'flat'>('m2')
  const [labRate, setLabRate] = useState('')

  // Custom tab state
  const [custDesc, setCustDesc] = useState('')
  const [custKind, setCustKind] = useState<QuoteLine['kind']>('material')
  const [custQty, setCustQty] = useState('1')
  const [custUnit, setCustUnit] = useState('m²')
  const [custPrice, setCustPrice] = useState('')

  const roomOptions = rooms.map(r => ({ value: r.id, label: r.name }))
  const matOptions = materials.map(m => ({ value: m.id, label: `${m.make} — ${m.range} (${MATERIAL_TYPE_LABELS[m.type]})` }))

  function getRoom(id: string) { return rooms.find(r => r.id === id) }
  function getMat(id: string) { return materials.find(m => m.id === id) }

  function addMaterial() {
    const room = getRoom(matRoomId); const mat = getMat(matId)
    if (!room || !mat) return
    onAdd(computeMaterialLine(room, mat, settings, {
      layPattern,
      doorwayDeductionMm: parseFloat(doorDeduct) * 1000 || 0,
      unitCount: parseFloat(unitCount) || 1,
    }))
    onClose()
  }

  function addLabour() {
    const room = getRoom(labRoomId)
    const rate = Math.round(parseFloat(labRate) * 100)
    if (!room || isNaN(rate)) return
    if (labType === 'm2') onAdd(computeLabourLine(room, rate))
    else if (labType === 'step') onAdd(computeStairLabourLine(room, rate))
    else onAdd(customLine(labRate ? `Labour` : 'Labour', 'labour', 1, 'job', rate))
    onClose()
  }

  function addAddon(makeIt: () => QuoteLine) { onAdd(makeIt()); onClose() }

  function addCustom() {
    const qty = parseFloat(custQty); const price = Math.round(parseFloat(custPrice) * 100)
    if (!custDesc.trim() || isNaN(qty) || isNaN(price)) return
    onAdd(customLine(custDesc.trim(), custKind, qty, custUnit, price))
    onClose()
  }

  // Quick add-ons using all rooms
  const totalAreaM2 = rooms.reduce((s, r) => s + roomAreaM2(r), 0)
  const totalPerimMm = rooms.reduce((s, r) => s + roomPerimeterMm(r), 0)
  const totalPerimM = calcLinear(totalPerimMm).linearMetres

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'material', label: 'Material' },
    { id: 'labour', label: 'Labour' },
    { id: 'addons', label: 'Add-ons' },
    { id: 'custom', label: 'Custom' },
  ]

  return (
    <Modal open={open} title="Add line" onClose={onClose} wide>
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 -mx-6 px-6 mb-4 gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[var(--color-brand)] text-[var(--color-brand)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'material' && (
        <div className="flex flex-col gap-4">
          {rooms.length === 0 && <p className="text-sm text-amber-600">Add rooms to the job first.</p>}
          {materials.length === 0 && <p className="text-sm text-amber-600">Add materials to the catalogue first.</p>}
          <Select label="Room" options={[{ value: '', label: 'Select room…' }, ...roomOptions]}
            value={matRoomId} onChange={e => setMatRoomId(e.target.value)} />
          <Select label="Material" options={[{ value: '', label: 'Select material…' }, ...matOptions]}
            value={matId} onChange={e => setMatId(e.target.value)} />
          {getMat(matId)?.sellingFormat === 'pack' && (
            <Select label="Lay pattern" options={LAY_OPTIONS} value={layPattern}
              onChange={e => setLayPattern(e.target.value as LayPattern)} />
          )}
          {getMat(matId)?.sellingFormat === 'linear' && (
            <Input label="Doorway deduction (m)" type="number" min="0" step="0.1" value={doorDeduct}
              onChange={e => setDoorDeduct(e.target.value)} hint="Total doorway width to subtract from perimeter" />
          )}
          {getMat(matId)?.sellingFormat === 'unit' && (
            <Input label="Quantity" type="number" min="1" step="1" value={unitCount}
              onChange={e => setUnitCount(e.target.value)} />
          )}
          {matRoomId && matId && (() => {
            const room = getRoom(matRoomId)!; const mat = getMat(matId)!
            const line = computeMaterialLine(room, mat, settings, { layPattern, doorwayDeductionMm: parseFloat(doorDeduct) * 1000 || 0, unitCount: parseFloat(unitCount) || 1 })
            return (
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-900">{line.computedQuantity} {line.unit} × £{(line.unitPricePence / 100).toFixed(2)} = <strong>£{(line.lineTotalPence / 100).toFixed(2)}</strong></p>
                {line.notes && <p className="text-blue-700 text-xs mt-1">{line.notes}</p>}
              </div>
            )
          })()}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={addMaterial} disabled={!matRoomId || !matId}>Add line</Button>
          </div>
        </div>
      )}

      {tab === 'labour' && (
        <div className="flex flex-col gap-4">
          <Select label="Room" options={[{ value: '', label: 'Select room…' }, ...roomOptions]}
            value={labRoomId} onChange={e => setLabRoomId(e.target.value)} />
          <Select label="Labour type"
            options={[{ value: 'm2', label: 'Per m² (fitting)' }, { value: 'step', label: 'Per step (stairs)' }, { value: 'flat', label: 'Flat rate' }]}
            value={labType} onChange={e => setLabType(e.target.value as typeof labType)} />
          <Input label={`Rate (£ per ${labType === 'm2' ? 'm²' : labType === 'step' ? 'step' : 'job'})`}
            type="number" min="0" step="0.50" value={labRate}
            onChange={e => setLabRate(e.target.value)}
            hint={labType === 'm2' ? `Default: £${(settings.labourRatePerM2Pence / 100).toFixed(2)}/m²` : labType === 'step' ? `Default: £${(settings.labourRatePerStepPence / 100).toFixed(2)}/step` : undefined} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={addLabour} disabled={!labRoomId || !labRate}>Add line</Button>
          </div>
        </div>
      )}

      {tab === 'addons' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 mb-2">Quick-add standard lines. Prices use your settings defaults — edit after adding.</p>
          {[
            {
              label: 'Subfloor prep / latex screed',
              hint: `${totalAreaM2.toFixed(1)} m² × rate`,
              make: () => buildQuoteLine({ id: newId(), kind: 'prep', description: 'Subfloor preparation / latex screed', computedQuantity: Math.ceil(totalAreaM2 * 100) / 100, unit: 'm²', unitPricePence: 300, wasteApplied: false }),
            },
            {
              label: 'Uplift & disposal of old flooring',
              hint: `${totalAreaM2.toFixed(1)} m² × rate`,
              make: () => buildQuoteLine({ id: newId(), kind: 'disposal', description: 'Uplift & disposal of existing flooring', computedQuantity: Math.ceil(totalAreaM2 * 100) / 100, unit: 'm²', unitPricePence: 250, wasteApplied: false }),
            },
            {
              label: 'Gripper rod',
              hint: `${totalPerimM} m`,
              make: () => buildQuoteLine({ id: newId(), kind: 'accessory', description: 'Gripper rod', computedQuantity: totalPerimM, unit: 'm', unitPricePence: 150, wasteApplied: false }),
            },
            {
              label: 'Door bar / threshold',
              hint: '1 unit (edit qty as needed)',
              make: () => buildQuoteLine({ id: newId(), kind: 'accessory', description: 'Door bar / threshold', computedQuantity: 1, unit: 'units', unitPricePence: 1800, wasteApplied: false }),
            },
            {
              label: 'Furniture moving',
              hint: 'Flat rate',
              make: () => buildQuoteLine({ id: newId(), kind: 'labour', description: 'Furniture moving', computedQuantity: 1, unit: 'job', unitPricePence: 5000, wasteApplied: false }),
            },
          ].map(({ label, hint, make }) => (
            <button key={label} onClick={() => addAddon(make)}
              className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-[var(--color-brand)] hover:bg-blue-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{hint}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {tab === 'custom' && (
        <div className="flex flex-col gap-4">
          <Input label="Description" value={custDesc} onChange={e => setCustDesc(e.target.value)} placeholder="e.g. Extra wide carpet roll surcharge" />
          <Select label="Kind" options={KIND_OPTIONS} value={custKind} onChange={e => setCustKind(e.target.value as QuoteLine['kind'])} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" type="number" min="0" step="any" value={custQty} onChange={e => setCustQty(e.target.value)} />
            <Input label="Unit" value={custUnit} onChange={e => setCustUnit(e.target.value)} placeholder="m², packs, job…" />
          </div>
          <Input label="Unit price (£)" type="number" min="0" step="0.01" value={custPrice} onChange={e => setCustPrice(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={addCustom} disabled={!custDesc.trim() || !custPrice}>Add line</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
