import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { quotesRepo, customersRepo, jobsRepo } from '../../data'
import type { Quote, Customer, Job } from '../../data'
import { formatPence } from '../../domain/units'
import { Badge } from '../../ui/Badge'
import { EmptyState } from '../../ui/EmptyState'
import { PageHeader } from '../../ui/PageHeader'
import { PageSpinner } from '../../ui/Spinner'

type Color = Parameters<typeof Badge>[0]['color']
const STATUS_COLOR: Record<Quote['status'], Color> = { draft: 'amber', sent: 'blue', accepted: 'green' }

function ClipboardIcon() {
  return <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
}

interface QuoteRow { quote: Quote; customer?: Customer; job?: Job }

export function QuotesPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const quotes = await quotesRepo.getAll()
    const rows = await Promise.all(quotes.map(async q => ({
      quote: q,
      customer: await customersRepo.get(q.customerId),
      job: await jobsRepo.get(q.jobId),
    })))
    setRows(rows)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Quotes" subtitle={`${rows.length} quote${rows.length !== 1 ? 's' : ''}`} />

      {rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardIcon />}
          title="No quotes yet"
          description="Build a quote from a customer's job page."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map(({ quote, customer, job }) => (
            <li key={quote.id}
              className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-gray-300 cursor-pointer transition-colors"
              onClick={() => navigate(`/quotes/${quote.id}`)}
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-900">{job?.address ?? 'Unknown job'}</span>
                  <Badge color={STATUS_COLOR[quote.status]}>{quote.status}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {customer?.name ?? '—'} · {quote.lines.length} line{quote.lines.length !== 1 ? 's' : ''}
                  · {new Date(quote.createdAt).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold text-[var(--color-brand)]">
                  {formatPence(quote.totals.grandTotalPence)}
                </p>
                <p className="text-xs text-gray-400">inc VAT</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
