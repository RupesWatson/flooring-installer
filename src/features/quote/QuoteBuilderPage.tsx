import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { jobsRepo, customersRepo, quotesRepo, materialsRepo } from '../../data'
import type { Job, Customer, Quote } from '../../data'
import type { Material } from '../../domain/materials'
import type { QuoteLine } from '../../domain/pricing'
import { computeTotals, presentTotals } from '../../domain/pricing'
import { formatPence } from '../../domain/units'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { PageHeader } from '../../ui/PageHeader'
import { PageSpinner } from '../../ui/Spinner'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { AddLineModal } from './AddLineModal'
import { useSettings } from '../settings/useSettings'

function PlusIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> }

const KIND_COLORS: Record<QuoteLine['kind'], string> = {
  material: 'text-blue-700 bg-blue-50',
  labour:   'text-green-700 bg-green-50',
  prep:     'text-amber-700 bg-amber-50',
  accessory:'text-purple-700 bg-purple-50',
  disposal: 'text-red-700 bg-red-50',
}

export function QuoteBuilderPage() {
  const { quoteId } = useParams<{ quoteId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { settings } = useSettings()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [deletingLine, setDeletingLine] = useState<QuoteLine | undefined>()
  const [vatInclusive, setVatInclusive] = useState(true)

  const load = useCallback(async () => {
    const [mats] = await Promise.all([materialsRepo.getAll()])
    setMaterials(mats)

    if (quoteId && quoteId !== 'new') {
      const q = await quotesRepo.get(quoteId)
      if (!q) return
      setQuote(q)
      setVatInclusive(q.vatInclusiveDisplay)
      const [j, c] = await Promise.all([jobsRepo.get(q.jobId), customersRepo.get(q.customerId)])
      setJob(j ?? null); setCustomer(c ?? null)
    }
  }, [quoteId])

  // Handle new quote creation
  useEffect(() => {
    if (quoteId !== 'new') { void load(); return }
    const jobId = searchParams.get('jobId')
    if (!jobId || !settings) return

    void (async () => {
      const [mats, j] = await Promise.all([materialsRepo.getAll(), jobsRepo.get(jobId)])
      if (!j) return
      setMaterials(mats)
      const c = await customersRepo.get(j.customerId)
      setJob(j); setCustomer(c ?? null)
      const q = await quotesRepo.create({
        customerId: j.customerId,
        jobId,
        lines: [],
        totals: computeTotals([], settings),
        status: 'draft',
        vatInclusiveDisplay: true,
      })
      setQuote(q)
      navigate(`/quotes/${q.id}`, { replace: true })
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, settings])

  if (!quote || !job || !settings) return <PageSpinner />

  // settings is guaranteed non-null below this point
  const safeSettings = settings
  const totals = computeTotals(quote.lines, safeSettings)
  const display = presentTotals(totals, vatInclusive)

  async function updateLines(lines: QuoteLine[]) {
    const newTotals = computeTotals(lines, safeSettings)
    const updated = { ...quote!, lines, totals: newTotals, vatInclusiveDisplay: vatInclusive }
    await quotesRepo.update(quote!.id, { lines, totals: newTotals })
    setQuote(updated)
  }

  async function addLine(line: QuoteLine) { await updateLines([...quote!.lines, line]) }

  async function deleteLine() {
    if (!deletingLine) return
    await updateLines(quote!.lines.filter(l => l.id !== deletingLine.id))
    setDeletingLine(undefined)
  }

  async function toggleVat() {
    const next = !vatInclusive
    setVatInclusive(next)
    await quotesRepo.update(quote!.id, { vatInclusiveDisplay: next })
  }

  // Group lines by room
  const roomMap = new Map(job.rooms.map(r => [r.id, r.name]))
  const groupedLines: Array<{ roomName: string; lines: QuoteLine[] }> = []
  const seen = new Set<string>()
  for (const line of quote.lines) {
    const key = line.roomId ?? '__global__'
    if (!seen.has(key)) {
      seen.add(key)
      groupedLines.push({ roomName: line.roomId ? (roomMap.get(line.roomId) ?? 'Unknown room') : 'Job-wide', lines: [] })
    }
    groupedLines[groupedLines.length - (seen.has(key) ? 0 : 1) - 1].lines.push(line)
  }
  // Rebuild properly
  const grouped = new Map<string, QuoteLine[]>()
  for (const line of quote.lines) {
    const key = line.roomId ?? '__global__'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(line)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader
        title={job.address}
        subtitle={customer?.name}
        backTo={`/customers/${job.customerId}/jobs/${job.id}`}
        actions={
          <div className="flex gap-2">
            <Badge color={quote.status === 'draft' ? 'amber' : quote.status === 'sent' ? 'blue' : 'green'}>
              {quote.status}
            </Badge>
            <Button size="sm" onClick={() => navigate(`/quotes/${quote.id}/output`)}>
              View / PDF
            </Button>
          </div>
        }
      />

      {/* Lines */}
      <div className="flex flex-col gap-4 mb-6">
        {grouped.size === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">No lines yet. Add a material or cost line to get started.</p>
          </div>
        ) : (
          [...grouped.entries()].map(([key, lines]) => (
            <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {key === '__global__' ? 'Job-wide' : roomMap.get(key) ?? 'Room'}
                </span>
              </div>
              <ul>
                {lines.map((line, i) => (
                  <li key={line.id} className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                    <span className={`mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${KIND_COLORS[line.kind]}`}>
                      {line.kind}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{line.description}</p>
                      <p className="text-xs text-gray-500">{line.computedQuantity} {line.unit} × £{(line.unitPricePence / 100).toFixed(2)}</p>
                      {line.notes && <p className="text-xs text-gray-400 mt-0.5">{line.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-gray-900">£{(line.lineTotalPence / 100).toFixed(2)}</span>
                      <button onClick={() => setDeletingLine(line)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        <Button variant="secondary" onClick={() => setAddOpen(true)}>
          <PlusIcon /> Add line
        </Button>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Totals</span>
          {settings.vatRegistered && (
            <button onClick={toggleVat}
              className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 hover:bg-gray-50">
              Show {vatInclusive ? 'ex' : 'inc'} VAT
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPence(display.displaySubtotal)}</span>
          </div>
          {settings.vatRegistered && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>VAT ({settings.vatRatePercent}%)</span>
              <span>{formatPence(display.displayVat)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-1">
            <span>Total {vatInclusive && settings.vatRegistered ? '(inc VAT)' : settings.vatRegistered ? '(ex VAT)' : ''}</span>
            <span className="text-[var(--color-brand)]">{formatPence(display.displayTotal)}</span>
          </div>
        </div>
        {totals.subtotalPence === settings.minimumChargePence && quote.lines.length > 0 && (
          <p className="text-xs text-amber-600 mt-2">Minimum charge applied (£{(settings.minimumChargePence / 100).toFixed(2)})</p>
        )}
      </div>

      <AddLineModal open={addOpen} rooms={job.rooms} materials={materials}
        settings={settings} onAdd={addLine} onClose={() => setAddOpen(false)} />
      <ConfirmDialog open={!!deletingLine} title="Remove line"
        message={`Remove "${deletingLine?.description}"?`}
        confirmLabel="Remove" onConfirm={deleteLine} onCancel={() => setDeletingLine(undefined)} />
    </div>
  )
}
