import { useState, useEffect, useCallback } from 'react'
import { settingsRepo } from '../../data'
import type { BusinessSettings } from '../../data'

export function useSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const s = await settingsRepo.ensureDefaults()
    setSettings(s)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const save = useCallback(async (s: BusinessSettings) => {
    await settingsRepo.save(s)
    setSettings(s)
  }, [])

  return { settings, loading, save, reload: load }
}
