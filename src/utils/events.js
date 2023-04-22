export const createEventEmitter = () => {
  const events = new Map()
  const on = (event, handler) => {
    if (!events.has(event)) {
      events.set(event, [])
    }
    events.get(event).push(handler)
    return () => off(event, handler)
  }
  const off = (event, handler) => {
    if (!events.has(event)) {
      return
    }
    events.set(event, events.get(event).filter(h => h !== handler))
  }
  return { on, off }
}

export const on = (element, event, handler) => {
  element.addEventListener(event, handler)
  return () => element.removeEventListener(event, handler)
}
