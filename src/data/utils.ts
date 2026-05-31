/** Generates a simple random ID — no external dependency. */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function now(): number {
  return Date.now()
}
