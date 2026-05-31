import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { customersRepo, jobsRepo } from '../../data'
import type { Customer, Job } from '../../data'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { PageHeader } from '../../ui/PageHeader'
import { PageSpinner } from '../../ui/Spinner'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { JobForm } from '../jobs/JobForm'

function HomeIcon() {
  return <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
}
function PlusIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> }

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobFormOpen, setJobFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | undefined>()
  const [deletingJob, setDeletingJob] = useState<Job | undefined>()

  const load = useCallback(async () => {
    if (!customerId) return
    const [c, js] = await Promise.all([customersRepo.get(customerId), jobsRepo.getByCustomer(customerId)])
    setCustomer(c ?? null)
    setJobs(js)
  }, [customerId])

  useEffect(() => { void load() }, [load])

  if (!customer) return <PageSpinner />

  async function handleSaveJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingJob) await jobsRepo.update(editingJob.id, data)
    else await jobsRepo.create(data)
    await load()
  }

  async function handleDeleteJob() {
    if (!deletingJob) return
    await jobsRepo.delete(deletingJob.id)
    setDeletingJob(undefined)
    await load()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title={customer.name}
        subtitle={[customer.phone, customer.email].filter(Boolean).join(' · ')}
        backTo="/customers"
        actions={
          <Button size="sm" onClick={() => { setEditingJob(undefined); setJobFormOpen(true) }}>
            <PlusIcon /> New job
          </Button>
        }
      />

      {customer.address && (
        <p className="text-sm text-gray-500 mb-4">{customer.address}</p>
      )}

      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
        Jobs ({jobs.length})
      </h2>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<HomeIcon />}
          title="No jobs yet"
          description="Create a job for this customer, then measure rooms and build a quote."
          action={<Button onClick={() => setJobFormOpen(true)}><PlusIcon /> New job</Button>}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {jobs.map(j => (
            <li key={j.id}
              className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-gray-300 cursor-pointer transition-colors"
              onClick={() => navigate(`/customers/${customerId}/jobs/${j.id}`)}
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{j.address}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {j.rooms.length} room{j.rooms.length !== 1 ? 's' : ''}
                  {j.rooms.length > 0 && ` · ${j.rooms.reduce((s, r) => s + r.rectangles.reduce((a, rect) => a + (rect.lengthMm / 1000) * (rect.widthMm / 1000), 0), 0).toFixed(1)} m²`}
                </p>
              </div>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                  onClick={() => { setEditingJob(j); setJobFormOpen(true) }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  onClick={() => setDeletingJob(j)}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <JobForm open={jobFormOpen} editing={editingJob} customerId={customerId!}
        onClose={() => setJobFormOpen(false)} onSave={handleSaveJob} />
      <ConfirmDialog open={!!deletingJob} title="Delete job"
        message={`Remove job at "${deletingJob?.address}"? All quotes for this job will also be deleted.`}
        onConfirm={handleDeleteJob} onCancel={() => setDeletingJob(undefined)} />
    </div>
  )
}
