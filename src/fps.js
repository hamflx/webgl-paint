export const initFpsDetection = () => {
  const height = 120
  const width = 600

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas)
  canvas.style.position = 'fixed'
  canvas.style.left = '0'
  canvas.style.bottom = '0'
  canvas.style.border = '1px solid rgb(234, 0, 94)'
  canvas.style.zIndex = '100000'
  canvas.style.opacity = '0.7'
  canvas.style.pointerEvents = 'none'

  const ctx = canvas.getContext('2d')

  const frame = () => {
    const now = performance.now()
    const duration = now - lastTime

    const fps = 1 / duration * 1000
    const dx = ((duration / 1000 / (1 / 60)) | 0)
    const y = height - fps
    const x = lastX + dx

    ctx.fillStyle = '#fff'
    ctx.fillRect(lastX + 2, 0, x - lastX, height)

    ctx.fillStyle = 'rgb(234, 0, 94)'
    ctx.fillRect(x + 2, 0, 5, height)

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    requestAnimationFrame(frame)

    lastX = x >= width ? 0 : x
    lastY = y
    lastTime = now
  }

  let lastTime = performance.now()
  let lastX = 0
  let lastY = 0
  ctx.strokeStyle = '#00A85C'
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  requestAnimationFrame(frame)
}
