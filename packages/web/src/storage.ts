export type GroupEntry = {
  id: string
  name: string
  lastVisited: number
}

const KEY = "who-pays:groups"

export function listGroups(): GroupEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return (JSON.parse(raw) as GroupEntry[]).sort((a, b) => b.lastVisited - a.lastVisited)
  } catch {
    return []
  }
}

export function upsertGroup(id: string, name: string): void {
  const groups = listGroups().filter((g) => g.id !== id)
  groups.unshift({ id, name, lastVisited: Date.now() })
  localStorage.setItem(KEY, JSON.stringify(groups))
}
