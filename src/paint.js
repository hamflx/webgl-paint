export const createPaint = container => {
  const canvas = createCanvas(container)

  let paintMode = null

  const setPaintMode = mode => { paintMode = mode }

  const getPaintMode = () => paintMode

  return { getPaintMode, setPaintMode }
}

export const PaintTool = {
  Pencil: 'pencil',
  Brush: 'brush',
  Eraser: 'eraser',
  Line: 'line',
  Rectangle: 'rectangle',
  Circle: 'circle',
  Text: 'text',
}

export const createPaintTools = () => {
  return [
    { name: '直线', mode: PaintTool.Line },
    { name: '矩形', mode: PaintTool.Rectangle }
  ]
}

const createToolbar = () => {}

const createCanvas = container => {
  const canvas = document.createElement('canvas')
  canvas.width = container.offsetWidth * window.devicePixelRatio
  canvas.height = container.offsetHeight * window.devicePixelRatio
  canvas.style.display = 'block'
  canvas.style.width = container.offsetWidth + 'px'
  canvas.style.height = container.offsetHeight + 'px'
  container.appendChild(canvas)
  return canvas
}
