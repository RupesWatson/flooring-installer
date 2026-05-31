import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsRepo, quotesRepo } from '../../data'
import type { Job } from '../../data'
import type { Room } from '../../domain/measurement'
import { roomAreaM2, roomPerimeterMm } from '../../domain/measurement'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { EmptyState } from '../../ui/EmptyState'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { PageHeader } from '../../ui/PageHeader'
import { PageSpinner } from '../../ui/Spinner'
import { RoomForm } from '../measure/RoomForm'
import { useUnitSystem } from '../../app/useUnitSystem'

function RulerIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}
function PlusIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> }

export function JobDetailPage() {
  const { customerId, jobId } = useParams<{ customerId: string; jobId: string }>()
  const navigate = useNavigate()
  const { unitSystem, toggle } = useUnitSystem()

  const [job, setJob] = useState<Job | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Room | undefined>()
  const [deleting, setDeleting] = useState<Room | undefined>()

  const load = useCallback(async () => {
    if (!jobId) return
    const j = await jobsRepo.get(jobId)
    setJob(j ?? null)
  }, [jobId])

  useEffect(() => { void load() }, [load])

  if (!job) return <PageSpinner />

  const rooms = job.rooms
  const totalArea = rooms.reduce((s, r) => s + roomAreaM2(r), 0)

  async function saveRoom(room: Room) {
    const updated = editing
      ? rooms.map(r => r.id === room.id ? room : r)
      : [...rooms, room]
    await jobsRepo.saveRooms(job!.id, updated)
    await load()
  }

  async function deleteRoom() {
    if (!deleting) return
    await jobsRepo.saveRooms(job!.id, rooms.filter(r => r.id !== deleting.id))
    setDeleting(undefined)
    await load()
  }

  async function startQuote() {
    const existing = await quotesRepo.getByJob(job!.id)
    if (existing.length > 0) {
      navigate(`/quotes/${existing[0].id}`)
      return
    }
    navigate(`/quotes/new?jobId=${job!.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title={job.address}
        subtitle={`${rooms.length} room${rooms.length !== 1 ? 's' : ''} · ${totalArea.toFixed(2)} m² total`}
        backTo={`/customers/${customerId}`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={toggle}
              className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 hover:bg-gray-50"
            >
              {unitSystem === 'metric' ? 'm' : 'ft'}
            </button>
            <Button variant="secondary" size="sm" onClick={() => { setEditing(undefined); setFormOpen(true) }}>
              <PlusIcon /> Room
            </Button>
            <Button size="sm" onClick={startQuote}>Build quote</Button>
          </div>
        }
      />

      {job.notes && (
        <p className="text-sm text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">{job.notes}</p>
      )}

      {rooms.length === 0 ? (
        <EmptyState
          icon={<RulerIcon />}
          title="No rooms yet"
          description="Add rooms and measure each one to build an accurate quote."
          action={<Button onClick={() => setFormOpen(true)}><PlusIcon /> Add room</Button>}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {rooms.map(r => {
            const area = roomAreaM2(r)
            const perim = roomPerimeterMm(r)
            return (
              <li key={r.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{r.name}</span>
                      {r.stairSteps > 0 && <Badge color="amber">{`${r.stairSteps} steps`}</Badge>}
                      {r.rectangles.length > 1 && <Badge color="purple">L-shape</Badge>}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>
                        {unitSystem === 'metric'
                          ? `${area.toFixed(2)} m²`
                          : `${(area * 10.764).toFixed(1)} ft²`}
                      </span>
                      <span>
                        Perimeter: {unitSystem === 'metric'
                          ? `${(perim / 1000).toFixed(1)} m`
                          : `${(perim / 304.8).toFixed(1)} ft`}
                        {r.perimeterOverrideMm != null && ' (override)'}
                      </span>
                    </div>
                    {r.rectangles.length > 1 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.rectangles.map(rect =>
                          unitSystem === 'metric'
                            ? `${(rect.lengthMm / 1000).toFixed(2)}×${(rect.widthMm / 1000).toFixed(2)} m`
                            : `${Math.floor(rect.lengthMm / 304.8)}'×${Math.floor(rect.widthMm / 304.8)}'`
                        ).join(' + ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                      onClick={() => { setEditing(r); setFormOpen(true) }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      onClick={() => setDeleting(r)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <RoomForm open={formOpen} editing={editing} unitSystem={unitSystem}
        onClose={() => setFormOpen(false)} onSave={saveRoom} />
      <ConfirmDialog open={!!deleting} title="Remove room"
        message={`Remove "${deleting?.name}" from this job?`}
        confirmLabel="Remove" onConfirm={deleteRoom} onCancel={() => setDeleting(undefined)} />
    </div>
  )
}
