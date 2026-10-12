import type { EventMap, EventName } from './types'

type Listener<K extends EventName> = (payload: EventMap[K]) => void

/**
 * Minimal, strongly typed event emitter used as the base for the tombola
 * domain objects. Keeps the core free of any framework dependency.
 */
export class Emitter {
  private listeners = new Map<EventName, Set<Listener<EventName>>>()

  on<K extends EventName>(event: K, listener: Listener<K>): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener as Listener<EventName>)
    return () => this.off(event, listener)
  }

  off<K extends EventName>(event: K, listener: Listener<K>): void {
    this.listeners.get(event)?.delete(listener as Listener<EventName>)
  }

  protected emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload))
  }

  protected clearListeners(): void {
    this.listeners.clear()
  }
}
