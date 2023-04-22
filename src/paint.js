import { invokeCallbacks } from "./utils/callbacks"
import { on } from "./utils/events"
import { createLineShape } from "./webgl/shapes/line"
import { createRectShape } from "./webgl/shapes/rect"

export const createPaint = container => {
  const dispose = []
  const canvas = createCanvas(container)
  const gl = prepareWebgl(canvas)

  const renderingItemList = []

  let paintMode = PaintTool.Line

  const setPaintMode = mode => { paintMode = mode }

  const getPaintMode = () => paintMode

  const renderFrame = () => {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    for (const item of renderingItemList) {
      item.render(gl)
    }
  }

  const requestRender = () => requestAnimationFrame(renderFrame)

  const beginEvent = mouseDownEvent => {
    const { offsetX: x, offsetY: y } = mouseDownEvent

    let item
    switch (paintMode) {
      case PaintTool.Line:
        item = createLineShape({ x1: x, y1: y, x2: x, y2: y })
        break
      case PaintTool.Rectangle:
        item = createRectShape({ x1: x, y1: y, x2: x, y2: y })
        break
    }

    if (!item) {
      return
    }

    renderingItemList.push(item)
    requestRender()

    const moveEvent = on(window, 'mousemove', mouseMoveEvent => {
      const { offsetX, offsetY } = mouseMoveEvent
      item.updateEndPoint({ x: offsetX, y: offsetY })
      requestRender()
    })

    const endEvent = on(window, 'mouseup', mouseUpEvent => {
      endEvent()
      moveEvent()

      const { offsetX, offsetY } = mouseUpEvent
      item.updateEndPoint({ x: offsetX, y: offsetY })
      requestRender()
    })

    return () => invokeCallbacks([moveEvent, endEvent])
  }
  dispose.push(on(canvas, 'mousedown', beginEvent))

  const destroy = () => invokeCallbacks(dispose)
  return { getPaintMode, setPaintMode, destroy }
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

/**
 * @param {HTMLCanvasElement} canvas 
 * @returns {WebGLRenderingContext}
 */
const prepareWebgl = canvas => {
  return canvas.getContext('webgl')
}

const createRect = () => {
  const render = () => {}
  return { render }
}
