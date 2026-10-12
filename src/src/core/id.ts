let counter = 0

/** Lightweight, dependency-free unique id generator for settings entities. */
export function createId(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}
