import { invokeCallbacks } from "./callbacks"

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
  const dispose = []
  const handlerWrapper = (...args) => {
    const result = handler(...args)
    if (typeof result === 'function') {
      dispose.push(result)
    }
  }
  element.addEventListener(event, handlerWrapper)
  return () => {
    element.removeEventListener(event, handlerWrapper)
    invokeCallbacks(dispose)
  }
}
