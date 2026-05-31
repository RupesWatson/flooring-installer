import { useState, useEffect } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { PageHeader } from '../../ui/PageHeader'
import { PageSpinner } from '../../ui/Spinner'
import { useSettings } from './useSettings'
import { exportData, downloadExport, importData } from '../../data'
import type { BusinessSettings } from '../../data'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  )
}

export function SettingsPage() {
  const { settings, loading, save } = useSettings()
  const [fields, setFields] = useState<BusinessSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  useEffect(() => {
    if (settings && !fields) setFields({ ...settings })
  }, [settings, fields])

  if (loading || !fields) return <PageSpinner />

  function set<K extends keyof BusinessSettings>(k: K, v: BusinessSettings[K]) {
    setFields(f => f ? { ...f, [k]: v } : f)
    setSaved(false)
  }

  async function handleSave() {
    if (!fields) return
    await save(fields)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleExport() {
    const json = await exportData()
    downloadExport(json)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importData(text)
      setImportMsg('Import successful — data restored.')
      setFields(null) // reload settings
    } catch (err) {
      setImportMsg(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    e.target.value = ''
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('logoDataUrl', reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <PageHeader
        title="Settings"
        actions={
          <Button onClick={handleSave}>{saved ? '✓ Saved' : 'Save changes'}</Button>
        }
      />

      <Section title="Business details">
        <Input label="Business name" value={fields.name}
          onChange={e => set('name', e.target.value)} placeholder="Your trading name" />
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Logo</p>
          {fields.logoDataUrl && (
            <div className="mb-2 flex items-center gap-3">
              <img src={fields.logoDataUrl} alt="logo" className="h-12 w-12 object-contain rounded border border-gray-200" />
              <Button variant="ghost" size="sm" onClick={() => set('logoDataUrl', undefined)}>Remove</Button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleLogoUpload}
            className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
          <p className="text-xs text-gray-400 mt-1">PNG or JPG, shown on quotes and PDFs</p>
        </div>
        <Textarea label="Default terms & conditions" value={fields.defaultTermsText}
          onChange={e => set('defaultTermsText', e.target.value)} />
      </Section>

      <Section title="VAT">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={fields.vatRegistered}
            onChange={e => set('vatRegistered', e.target.checked)}
            className="w-4 h-4 rounded text-[var(--color-brand)]" />
          <span className="text-sm text-gray-700">VAT registered</span>
        </label>
        {fields.vatRegistered && (
          <Input label="VAT rate (%)" type="number" min="0" max="100" step="1"
            value={fields.vatRatePercent.toString()}
            onChange={e => set('vatRatePercent', parseFloat(e.target.value) || 0)} />
        )}
      </Section>

      <Section title="Labour rates">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fitting labour (£/m²)" type="number" min="0" step="0.50"
            value={(fields.labourRatePerM2Pence / 100).toFixed(2)}
            onChange={e => set('labourRatePerM2Pence', Math.round(parseFloat(e.target.value) * 100) || 0)} />
          <Input label="Stair labour (£/step)" type="number" min="0" step="0.50"
            value={(fields.labourRatePerStepPence / 100).toFixed(2)}
            onChange={e => set('labourRatePerStepPence', Math.round(parseFloat(e.target.value) * 100) || 0)} />
        </div>
        <Input label="Minimum charge (£)" type="number" min="0" step="5"
          value={(fields.minimumChargePence / 100).toFixed(2)}
          onChange={e => set('minimumChargePence', Math.round(parseFloat(e.target.value) * 100) || 0)} />
      </Section>

      <Section title="Waste factors (default)">
        <div className="grid grid-cols-3 gap-3">
          {([
            ['Straight lay (%)', 'defaultWasteFactorStraight'],
            ['Diagonal lay (%)', 'defaultWasteFactorDiagonal'],
            ['Herringbone (%)', 'defaultWasteFactorHerringbone'],
          ] as const).map(([label, key]) => (
            <Input key={key} label={label} type="number" min="0" max="50" step="1"
              value={Math.round((fields[key] as number) * 100).toString()}
              onChange={e => set(key, (parseFloat(e.target.value) || 0) / 100)} />
          ))}
        </div>
      </Section>

      <Section title="Data">
        <p className="text-sm text-gray-500">All data is stored on this device. Export a backup regularly, especially before clearing browser data.</p>
        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={handleExport}>Export backup (.json)</Button>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Import backup</label>
            <input type="file" accept=".json" onChange={handleImport}
              className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            <p className="text-xs text-amber-600 mt-1">Warning: importing will replace all current data.</p>
          </div>
          {importMsg && (
            <p className={`text-sm ${importMsg.startsWith('Import successful') ? 'text-green-600' : 'text-red-600'}`}>
              {importMsg}
            </p>
          )}
        </div>
      </Section>

      <div className="text-xs text-gray-400 text-center pb-4">
        Flooring Installer v1 · All data stored locally on this device
      </div>
    </div>
  )
}
