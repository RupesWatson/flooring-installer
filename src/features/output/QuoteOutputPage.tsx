import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { quotesRepo, customersRepo, jobsRepo } from '../../data'
import type { Quote, Customer, Job } from '../../data'
import { formatPence } from '../../domain/units'
import { presentTotals } from '../../domain/pricing'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { PageHeader } from '../../ui/PageHeader'
import { PageSpinner } from '../../ui/Spinner'
import { QuoteDocument } from './QuotePDF'
import { useSettings } from '../settings/useSettings'

type StatusColor = Parameters<typeof Badge>[0]['color']
const STATUS_COLOR: Record<Quote['status'], StatusColor> = { draft: 'amber', sent: 'blue', accepted: 'green' }

const KIND_LABEL: Record<string, string> = {
  material: 'Material', labour: 'Labour', prep: 'Prep', accessory: 'Accessory', disposal: 'Disposal',
}

export function QuoteOutputPage() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const { settings } = useSettings()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [job, setJob] = useState<Job | null>(null)

  const load = useCallback(async () => {
    if (!quoteId) return
    const q = await quotesRepo.get(quoteId)
    if (!q) return
    setQuote(q)
    const [c, j] = await Promise.all([customersRepo.get(q.customerId), jobsRepo.get(q.jobId)])
    setCustomer(c ?? null); setJob(j ?? null)
  }, [quoteId])

  useEffect(() => { void load() }, [load])

  if (!quote || !customer || !job || !settings) return <PageSpinner />

  const display = presentTotals(quote.totals, quote.vatInclusiveDisplay)
  const fileName = `quote-${customer.name.replace(/\s+/g, '-').toLowerCase()}-${new Date(quote.createdAt).toISOString().slice(0, 10)}.pdf`

  async function markSent() {
    await quotesRepo.updateStatus(quote!.id, 'sent')
    await load()
  }
  async function markAccepted() {
    await quotesRepo.updateStatus(quote!.id, 'accepted')
    await load()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title="Quote"
        subtitle={`${customer.name} — ${job.address}`}
        backTo={`/quotes/${quoteId}`}
        actions={
          <div className="flex gap-2 items-center">
            <Badge color={STATUS_COLOR[quote.status]}>{quote.status}</Badge>
            {quote.status === 'draft' && <Button size="sm" variant="secondary" onClick={markSent}>Mark sent</Button>}
            {quote.status === 'sent' && <Button size="sm" variant="secondary" onClick={markAccepted}>Mark accepted</Button>}
          </div>
        }
      />

      {/* Quote preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-[var(--color-brand)] text-white px-6 py-5 flex items-start justify-between">
          <div>
            <p className="font-bold text-lg">{settings.name}</p>
            <p className="text-sm opacity-80 mt-0.5">Quote</p>
          </div>
          {settings.logoDataUrl && (
            <img src={settings.logoDataUrl} alt="logo" className="h-12 w-12 object-contain rounded" />
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-100 text-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Customer</p>
            <p className="font-medium text-gray-900">{customer.name}</p>
            {customer.phone && <p className="text-gray-500">{customer.phone}</p>}
            {customer.email && <p className="text-gray-500">{customer.email}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Property</p>
            <p className="text-gray-700">{job.address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Date</p>
            <p className="text-gray-700">{new Date(quote.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Lines */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500">Description</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Qty</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Unit price</th>
              <th className="text-right px-6 py-2 text-xs font-semibold text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line, i) => (
              <tr key={line.id} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                <td className="px-6 py-2.5">
                  <p className="font-medium text-gray-900">{line.description}</p>
                  {line.notes && <p className="text-xs text-gray-400 mt-0.5">{line.notes}</p>}
                  <span className="text-xs text-gray-400">{KIND_LABEL[line.kind]}</span>
                </td>
                <td className="px-3 py-2.5 text-right text-gray-600">{line.computedQuantity} {line.unit}</td>
                <td className="px-3 py-2.5 text-right text-gray-600">{formatPence(line.unitPricePence)}</td>
                <td className="px-6 py-2.5 text-right font-semibold text-gray-900">{formatPence(line.lineTotalPence)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col items-end gap-1.5">
          {settings.vatRegistered && (
            <>
              <div className="flex gap-16 text-sm text-gray-600">
                <span>Subtotal (ex VAT)</span>
                <span>{formatPence(display.displaySubtotal)}</span>
              </div>
              <div className="flex gap-16 text-sm text-gray-600">
                <span>VAT ({settings.vatRatePercent}%)</span>
                <span>{formatPence(display.displayVat)}</span>
              </div>
            </>
          )}
          <div className="flex gap-16 text-base font-bold text-[var(--color-brand)]">
            <span>Total {settings.vatRegistered ? (quote.vatInclusiveDisplay ? '(inc VAT)' : '(ex VAT)') : ''}</span>
            <span>{formatPence(display.displayTotal)}</span>
          </div>
        </div>

        {/* Terms */}
        {settings.defaultTermsText && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Terms & Conditions</p>
            <p className="text-xs text-gray-500 leading-relaxed">{settings.defaultTermsText}</p>
          </div>
        )}
      </div>

      {/* Download */}
      <PDFDownloadLink
        document={<QuoteDocument quote={quote} customer={customer} job={job} settings={settings} />}
        fileName={fileName}
      >
        {({ loading: pdfLoading }) => (
          <Button className="w-full justify-center" disabled={pdfLoading}>
            {pdfLoading ? 'Generating PDF…' : '⬇ Download PDF'}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}
