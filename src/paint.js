import { invokeCallbacks } from "./utils/callbacks"
import { on } from "./utils/events"
import { getColorPlateColors, normalizeColor } from "./webgl/common/colors"
import { PaintTool } from "./webgl/common/tools"
import { createBrushShape, createBrushTool } from "./webgl/shapes/brush"
import { createLineShape, createLineTool } from "./webgl/shapes/line"
import { createRectShape, createRectTool } from "./webgl/shapes/rect"

export const createPaint = container => {
  const dispose = []
  const canvas = createCanvas(container)
  const gl = prepareWebgl(canvas)
  const tools = [createBrushTool(gl), createLineTool(gl), createRectTool(gl)]

  const renderingItemList = []
  const undoStack = []
  const redoStack = []

  const renderingContext = {
    gl,
    thickness: 2,
    paintMode: PaintTool.Line,
    foregroundColor: getColorPlateColors()[0],
    backgroundColor: getColorPlateColors().slice(-1)[0]
  }
  const setPaintMode = mode => { renderingContext.paintMode = mode }
  const setForegroundColor = color => { renderingContext.foregroundColor = color }
  const setBackgroundColor = color => { renderingContext.backgroundColor = color }
  const getPaintMode = () => renderingContext.paintMode
  const getForegroundColor = () => renderingContext.foregroundColor
  const getBackgroundColor = () => renderingContext.backgroundColor
  const setThickness = mode => { renderingContext.thickness = mode }
  const getThickness = () => renderingContext.thickness

  const renderFrame = () => {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const itemsWithIndex = renderingItemList.map((item, index) => ({ item, index }))
    for (const tool of tools) {
      const shapes = itemsWithIndex.filter(({ item }) => item.type === tool.type)
      let offset = 0
      const vertices = []
      const indices = []
      for (const { item, index } of shapes) {
        const zIndex = 1 - (index + 1) / itemsWithIndex.length
        const { count } = item.prepare(vertices, indices, offset, zIndex)
        offset += count
      }
      if (indices.length) {
        tool.draw(vertices, indices)
      }
    }
  }

  let handle = 0
  const requestRender = () => {
    cancelAnimationFrame(handle)
    handle = requestAnimationFrame(renderFrame)
  }

  const beginEvent = mouseDownEvent => {
    const { offsetX: x, offsetY: y } = mouseDownEvent

    let item
    const ctx = getNormalizedRenderingContext(renderingContext)
    switch (renderingContext.paintMode) {
      case PaintTool.Line:
        item = createLineShape(ctx, { x1: x, y1: y, x2: x, y2: y })
        break
      case PaintTool.Rectangle:
        item = createRectShape(ctx, { x1: x, y1: y, x2: x, y2: y })
        break
      case PaintTool.Brush:
        item = createBrushShape(ctx, { x, y })
        break
    }

    if (!item) {
      return
    }

    undoStack.push([...renderingItemList])
    redoStack.length = 0
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

  const onKeydown = keydownEvent => {
    if (keydownEvent.code === 'KeyZ' && keydownEvent.ctrlKey) {
      undo()
    }
    if (keydownEvent.code === 'KeyY' && keydownEvent.ctrlKey) {
      redo()
    }
  }
  dispose.push(on(canvas, 'keydown', onKeydown))

  const undo = () => {
    const stackItem = undoStack.pop()
    if (stackItem) {
      redoStack.push([...renderingItemList])
      renderingItemList.length = 0

      for (const item of stackItem) {
        renderingItemList.push(item)
      }
      requestRender()
    }
  }

  const redo = () => {
    const stackItem = redoStack.pop()
    if (stackItem) {
      undoStack.push([...renderingItemList])
      renderingItemList.length = 0

      for (const item of stackItem) {
        renderingItemList.push(item)
      }
      requestRender()
    }
  }

  const destroy = () => invokeCallbacks(dispose)
  return { getPaintMode, setPaintMode, setForegroundColor, setBackgroundColor, getForegroundColor, getBackgroundColor, setThickness, getThickness, undo, redo, destroy }
}

export const createPaintTools = () => {
  return [
    { name: '直线', mode: PaintTool.Line },
    { name: '矩形', mode: PaintTool.Rectangle },
    { name: '刷子', mode: PaintTool.Brush },
  ]
}

const getNormalizedRenderingContext = ctx => {
  return {
    ...ctx,
    foregroundColor: normalizeColor(ctx.foregroundColor),
    backgroundColor: normalizeColor(ctx.backgroundColor)
  }
}

const createCanvas = container => {
  const canvas = document.createElement('canvas')
  canvas.width = container.offsetWidth * window.devicePixelRatio
  canvas.height = container.offsetHeight * window.devicePixelRatio
  canvas.style.display = 'block'
  canvas.style.width = container.offsetWidth + 'px'
  canvas.style.height = container.offsetHeight + 'px'
  canvas.style.outline = 'none'
  canvas.tabIndex = 0
  container.appendChild(canvas)
  return canvas
}

/**
 * @param {HTMLCanvasElement} canvas 
 * @returns {WebGLRenderingContext}
 */
const prepareWebgl = canvas => {
  const gl = canvas.getContext('webgl')
  gl.enable(gl.DEPTH_TEST)
  return gl
}
