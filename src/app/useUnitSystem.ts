import { useState, useCallback } from 'react'
import type { UnitSystem } from '../domain/units'

const KEY = 'flooring-unit-system'

function read(): UnitSystem {
  return (localStorage.getItem(KEY) as UnitSystem) ?? 'metric'
}

export function useUnitSystem() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(read)

  const toggle = useCallback(() => {
    setUnitSystem(prev => {
      const next = prev === 'metric' ? 'imperial' : 'metric'
      localStorage.setItem(KEY, next)
      return next
    })
  }, [])

  return { unitSystem, toggle }
}
