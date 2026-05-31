import { useState, useEffect } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import type { Customer } from '../../data'

interface Props {
  open: boolean
  editing?: Customer
  onClose: () => void
  onSave: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

interface Fields { name: string; phone: string; email: string; address: string }
const empty = (): Fields => ({ name: '', phone: '', email: '', address: '' })

export function CustomerForm({ open, editing, onClose, onSave }: Props) {
  const [fields, setFields] = useState<Fields>(empty)
  const [nameErr, setNameErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setFields(editing
        ? { name: editing.name, phone: editing.phone ?? '', email: editing.email ?? '', address: editing.address ?? '' }
        : empty())
      setNameErr('')
    }
  }, [open, editing])

  function set(k: keyof Fields, v: string) {
    setFields(f => ({ ...f, [k]: v }))
    if (k === 'name') setNameErr('')
  }

  async function submit() {
    if (!fields.name.trim()) { setNameErr('Name is required'); return }
    setSaving(true)
    try {
      await onSave({
        name: fields.name.trim(),
        ...(fields.phone.trim() && { phone: fields.phone.trim() }),
        ...(fields.email.trim() && { email: fields.email.trim() }),
        ...(fields.address.trim() && { address: fields.address.trim() }),
      })
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <Modal
      open={open}
      title={editing ? 'Edit customer' : 'New customer'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Add customer'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={fields.name} onChange={e => set('name', e.target.value)} error={nameErr} placeholder="Full name or company" />
        <Input label="Phone" type="tel" value={fields.phone} onChange={e => set('phone', e.target.value)} placeholder="07700 900000" />
        <Input label="Email" type="email" value={fields.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" />
        <Input label="Address" value={fields.address} onChange={e => set('address', e.target.value)} placeholder="Street, Town, Postcode" />
      </div>
    </Modal>
  )
}
