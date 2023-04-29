export const getColorPlateColors = () => Array.from({ length: 12 }).map((_, i) => {
  return `hsl(${i / 12 * 360}deg 90% 85%)`
})

/**
 * 
 * @param {string} color
 * @returns {[number, number, number]}
 */
export const normalizeColor = color => {
  const el = document.createElement('div')
  el.style.color = color
  document.body.appendChild(el)
  const match = getComputedStyle(el).color.match(/rgb\((\d+), (\d+), (\d+)\)/)
  el.remove()
  return [match[1] / 255, match[2] / 255, match[3] / 255]
}
