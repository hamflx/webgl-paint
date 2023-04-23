import { reactive, ref, watchEffect } from 'vue'

export const createPaintReactiveState = () => {
  const properties = ['foregroundColor', 'backgroundColor', 'paintMode', 'thickness']
  const paintInst = ref(null)
  const paintState = reactive(properties.reduce(
    (map, prop) => ({ ...map, [prop]: null }),
    {}
  ))
  const updateReactiveState = prop => {
    if (paintInst.value) {
      const getter = `get${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}`
      const value = paintInst.value[getter]()
      if (value !== paintState[prop]) {
        paintState[prop] = value
      }
    }
  }
  const setPaintProperty = prop => {
    const getter = `get${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}`
    const setter = `set${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}`
    if (paintInst.value && paintState[prop] && paintState[prop] !== paintInst.value[getter]()) {
      paintInst.value[setter](paintState[prop])
    }
  }

  for (const prop of properties) {
    watchEffect(() => {
      setPaintProperty(prop)
    })
  }

  const setPaintInstance = paint => {
    paintInst.value = paint
    properties.forEach(prop => updateReactiveState(prop))
  }

  return { paintState, setPaintInstance }
}
