import { useState, useEffect } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import type { Job } from '../../data'

interface Props {
  open: boolean
  editing?: Job
  onClose: () => void
  onSave: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  customerId: string
}

export function JobForm({ open, editing, onClose, onSave, customerId }: Props) {
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [addrErr, setAddrErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setAddress(editing?.address ?? ''); setNotes(editing?.notes ?? ''); setAddrErr('')
    }
  }, [open, editing])

  async function submit() {
    if (!address.trim()) { setAddrErr('Address is required'); return }
    setSaving(true)
    try {
      await onSave({ customerId, address: address.trim(), rooms: editing?.rooms ?? [], ...(notes.trim() && { notes: notes.trim() }) })
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} title={editing ? 'Edit job' : 'New job'} onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Create job'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Property address" value={address} onChange={e => { setAddress(e.target.value); setAddrErr('') }}
          error={addrErr} placeholder="123 Oak Street, Town, AB1 2CD" />
        <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Access, parking, any special notes…" />
      </div>
    </Modal>
  )
}
