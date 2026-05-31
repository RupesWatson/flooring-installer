import { useState, useEffect } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Textarea } from '../../ui/Textarea'
import { UK_ROOM_PRESETS, roomAreaM2, roomPerimeterMm } from '../../domain/measurement'
import type { Room, Rectangle, RoomPreset } from '../../domain/measurement'
import { mmToFeetAndInches, feetInchesToMm, mToMm, m2ToFt2 } from '../../domain/units'
import type { UnitSystem } from '../../domain/units'
import { newId } from '../../data/utils'

interface Props {
  open: boolean
  editing?: Room
  unitSystem: UnitSystem
  onClose: () => void
  onSave: (room: Room) => void
}

const PRESET_OPTIONS = UK_ROOM_PRESETS.map(p => ({ value: p, label: p }))

interface RectFields { lengthM: string; widthM: string; lengthFt: string; lengthIn: string; widthFt: string; widthIn: string }
const emptyRect = (): RectFields => ({ lengthM: '', widthM: '', lengthFt: '', lengthIn: '0', widthFt: '', widthIn: '0' })

function rectToFields(r: Rectangle, us: UnitSystem): RectFields {
  if (us === 'metric') {
    return { lengthM: (r.lengthMm / 1000).toFixed(2), widthM: (r.widthMm / 1000).toFixed(2), lengthFt: '', lengthIn: '0', widthFt: '', widthIn: '0' }
  }
  const l = mmToFeetAndInches(r.lengthMm)
  const w = mmToFeetAndInches(r.widthMm)
  return { lengthM: '', widthM: '', lengthFt: l.feet.toString(), lengthIn: l.inches.toString(), widthFt: w.feet.toString(), widthIn: w.inches.toString() }
}

function fieldsToMm(f: RectFields, us: UnitSystem): { lengthMm: number; widthMm: number } | null {
  if (us === 'metric') {
    const l = parseFloat(f.lengthM), w = parseFloat(f.widthM)
    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return null
    return { lengthMm: mToMm(l), widthMm: mToMm(w) }
  }
  const lf = parseFloat(f.lengthFt), li = parseFloat(f.lengthIn)
  const wf = parseFloat(f.widthFt), wi = parseFloat(f.widthIn)
  if (isNaN(lf) || isNaN(wf) || lf < 0 || wf < 0) return null
  const lmm = feetInchesToMm(lf, isNaN(li) ? 0 : li)
  const wmm = feetInchesToMm(wf, isNaN(wi) ? 0 : wi)
  if (lmm <= 0 || wmm <= 0) return null
  return { lengthMm: lmm, widthMm: wmm }
}

function fmtLength(mm: number, us: UnitSystem): string {
  if (us === 'metric') return `${(mm / 1000).toFixed(2)} m`
  const { feet, inches } = mmToFeetAndInches(mm)
  return `${feet}' ${inches}"`
}

function RectangleRow({ fields, index, unitSystem, onChange, onRemove, canRemove }: {
  fields: RectFields; index: number; unitSystem: UnitSystem
  onChange: (f: RectFields) => void; onRemove: () => void; canRemove: boolean
}) {
  const label = index === 0 ? 'Main rectangle' : `Rectangle ${index + 1}`
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {canRemove && (
          <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        )}
      </div>
      {unitSystem === 'metric' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input label="Length (m)" type="number" step="0.01" min="0.01" value={fields.lengthM}
            onChange={e => onChange({ ...fields, lengthM: e.target.value })} />
          <Input label="Width (m)" type="number" step="0.01" min="0.01" value={fields.widthM}
            onChange={e => onChange({ ...fields, widthM: e.target.value })} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Length</p>
            <div className="grid grid-cols-2 gap-1">
              <Input label="ft" value={fields.lengthFt} type="number" min="0" step="1"
                onChange={e => onChange({ ...fields, lengthFt: e.target.value })} />
              <Input label="in" value={fields.lengthIn} type="number" min="0" max="11.875" step="0.125"
                onChange={e => onChange({ ...fields, lengthIn: e.target.value })} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Width</p>
            <div className="grid grid-cols-2 gap-1">
              <Input label="ft" value={fields.widthFt} type="number" min="0" step="1"
                onChange={e => onChange({ ...fields, widthFt: e.target.value })} />
              <Input label="in" value={fields.widthIn} type="number" min="0" max="11.875" step="0.125"
                onChange={e => onChange({ ...fields, widthIn: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function RoomForm({ open, editing, unitSystem, onClose, onSave }: Props) {
  const [type, setType] = useState<RoomPreset>('Living room')
  const [customName, setCustomName] = useState('')
  const [rects, setRects] = useState<RectFields[]>([emptyRect()])
  const [stairs, setStairs] = useState('0')
  const [perimeterOverride, setPerimeterOverride] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    if (editing) {
      setType(editing.type)
      setCustomName(editing.type === 'Custom' ? editing.name : '')
      setRects(editing.rectangles.length > 0
        ? editing.rectangles.map(r => rectToFields(r, unitSystem))
        : [emptyRect()])
      setStairs(editing.stairSteps.toString())
      setPerimeterOverride(editing.perimeterOverrideMm != null ? (editing.perimeterOverrideMm / 1000).toFixed(2) : '')
      setNotes(editing.notes ?? '')
    } else {
      setType('Living room'); setCustomName(''); setRects([emptyRect()])
      setStairs('0'); setPerimeterOverride(''); setNotes('')
    }
    setErrors([])
  }, [open, editing, unitSystem])

  // reformat rect fields when unit system changes
  useEffect(() => {
    if (!open) return
    setRects(prev => prev.map(f => {
      const mm = fieldsToMm(f, unitSystem === 'metric' ? 'imperial' : 'metric')
      if (!mm) return emptyRect()
      return rectToFields(mm, unitSystem)
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem])

  function submit() {
    const errs: string[] = []
    if (type === 'Custom' && !customName.trim()) errs.push('Enter a room name')
    const parsedRects: Rectangle[] = []
    for (let i = 0; i < rects.length; i++) {
      const mm = fieldsToMm(rects[i], unitSystem)
      if (!mm) errs.push(`Rectangle ${i + 1}: enter valid dimensions`)
      else parsedRects.push(mm)
    }
    if (errs.length > 0) { setErrors(errs); return }
    const perimMm = perimeterOverride.trim() ? mToMm(parseFloat(perimeterOverride)) : undefined
    const room: Room = {
      id: editing?.id ?? newId(),
      name: type === 'Custom' ? customName.trim() : type,
      type,
      rectangles: parsedRects,
      stairSteps: Math.max(0, parseInt(stairs) || 0),
      ...(perimMm != null && { perimeterOverrideMm: perimMm }),
      ...(notes.trim() && { notes: notes.trim() }),
    }
    onSave(room)
    onClose()
  }

  // live preview
  const liveRects = rects.map(f => fieldsToMm(f, unitSystem)).filter((x): x is Rectangle => x != null)
  const previewRoom = { rectangles: liveRects, perimeterOverrideMm: perimeterOverride.trim() ? mToMm(parseFloat(perimeterOverride)) : undefined }
  const areaM2 = liveRects.length > 0 ? roomAreaM2({ rectangles: liveRects }) : 0
  const perimMm = liveRects.length > 0 ? roomPerimeterMm(previewRoom) : 0

  return (
    <Modal
      open={open} title={editing ? 'Edit room' : 'Add room'}
      onClose={onClose} wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{editing ? 'Save changes' : 'Add room'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {errors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}

        <Select label="Room type" options={PRESET_OPTIONS} value={type}
          onChange={e => setType(e.target.value as RoomPreset)} />

        {type === 'Custom' && (
          <Input label="Room name" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Upstairs landing" />
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Dimensions</span>
            <span className="text-xs text-gray-500">{unitSystem === 'metric' ? 'metres' : 'feet & inches'}</span>
          </div>
          {rects.map((f, i) => (
            <RectangleRow key={i} fields={f} index={i} unitSystem={unitSystem}
              onChange={nf => setRects(r => r.map((x, j) => j === i ? nf : x))}
              onRemove={() => setRects(r => r.filter((_, j) => j !== i))}
              canRemove={rects.length > 1} />
          ))}
          <Button variant="ghost" size="sm" onClick={() => setRects(r => [...r, emptyRect()])}>
            + Add rectangle (L-shape)
          </Button>
        </div>

        {/* Live area / perimeter */}
        {areaM2 > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-blue-500 font-medium">Area</p>
              <p className="font-semibold text-blue-900">
                {unitSystem === 'metric' ? `${areaM2.toFixed(2)} m²` : `${m2ToFt2(areaM2).toFixed(1)} ft²`}
                {unitSystem === 'imperial' && <span className="text-xs text-blue-500 ml-1">({areaM2.toFixed(2)} m²)</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-500 font-medium">Perimeter {perimeterOverride.trim() ? '(override)' : '(estimated)'}</p>
              <p className="font-semibold text-blue-900">{fmtLength(perimMm, unitSystem)}</p>
            </div>
          </div>
        )}

        {type === 'Stairs' && (
          <Input label="Number of steps" type="number" min="0" step="1" value={stairs}
            onChange={e => setStairs(e.target.value)} hint="Each step is priced individually" />
        )}

        <Input label="Perimeter override (m)" type="number" step="0.01" min="0" value={perimeterOverride}
          onChange={e => setPerimeterOverride(e.target.value)}
          hint="Override estimated perimeter for L-shaped rooms (used for gripper rod)" />

        <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this room…" />
      </div>
    </Modal>
  )
}
