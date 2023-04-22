export const invokeCallbacks = (callbacks, ...args) => {
  callbacks.forEach(callback => callback(...args))
}
