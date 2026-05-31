import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { customersRepo } from '../../data'
import type { Customer } from '../../data'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { PageHeader } from '../../ui/PageHeader'
import { CustomerForm } from './CustomerForm'

function PersonIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function PlusIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> }

export function CustomersPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | undefined>()
  const [deleting, setDeleting] = useState<Customer | undefined>()

  const load = useCallback(() => customersRepo.getAll().then(setCustomers), [])
  useEffect(() => { void load() }, [load])

  const filtered = customers.filter(c =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search) || (c.address ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editing) await customersRepo.update(editing.id, data)
    else await customersRepo.create(data)
    await load()
  }

  async function handleDelete() {
    if (!deleting) return
    await customersRepo.delete(deleting.id)
    setDeleting(undefined)
    await load()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
        actions={<Button onClick={() => { setEditing(undefined); setFormOpen(true) }}><PlusIcon /> New customer</Button>}
      />

      {customers.length > 0 && (
        <input
          type="search" placeholder="Search customers…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PersonIcon />}
          title={customers.length === 0 ? 'No customers yet' : 'No results'}
          description={customers.length === 0 ? 'Add your first customer to start measuring and quoting.' : undefined}
          action={customers.length === 0 ? <Button onClick={() => setFormOpen(true)}><PlusIcon /> New customer</Button> : undefined}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map(c => (
            <li key={c.id}
              className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => navigate(`/customers/${c.id}`)}
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[c.phone, c.address].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                  onClick={() => { setEditing(c); setFormOpen(true) }} title="Edit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                  onClick={() => setDeleting(c)} title="Delete">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CustomerForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />
      <ConfirmDialog
        open={!!deleting} title="Delete customer"
        message={`Remove "${deleting?.name}" and all their jobs and quotes? This cannot be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleting(undefined)}
      />
    </div>
  )
}
