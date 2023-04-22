export const initializeOnce = fn => {
  let initialized = false
  let value = null
  return (...args) => {
    if (initialized) {
      return value
    }
    initialized = true
    value = fn(...args)
    return value
  }
}
