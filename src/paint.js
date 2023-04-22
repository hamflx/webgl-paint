import { invokeCallbacks } from "./utils/callbacks"
import { on } from "./utils/events"
import { initializeOnce } from "./utils/hooks"

export const createPaint = container => {
  const dispose = []
  const canvas = createCanvas(container)
  const gl = prepareWebgl(canvas)

  let paintMode = null

  const setPaintMode = mode => { paintMode = mode }

  const getPaintMode = () => paintMode

  const beginEvent = mouseDownEvent => {
    const { offsetX: x, offsetY: y } = mouseDownEvent

    const item = createLine({ x1: x, y1: y, x2: x, y2: y })
    item.render(gl)

    const moveEvent = on(window, 'mousemove', mouseMoveEvent => {
      const { offsetX, offsetY } = mouseMoveEvent
      item.updateEndPoint({ x: offsetX, y: offsetY })
      item.render(gl)
    })

    const endEvent = on(window, 'mouseup', mouseUpEvent => {
      endEvent()
      moveEvent()

      const { offsetX, offsetY } = mouseUpEvent
      item.updateEndPoint({ x: offsetX, y: offsetY })
      item.render(gl)
      console.log({offsetX, offsetY})
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

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} source
 * @param {number} type
 * @returns {WebGLShader}
 */
const createShader = (gl, source, type) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    const message = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragShader
 * @returns {WebGLProgram}
 */
const createProgram = (gl, vertexShader, fragShader) => {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    const message = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(message)
  }
  return program
}

const createRect = () => {
  const render = () => {}
  return { render }
}

const createLine = ({ x1, y1, x2, y2 }) => {
  const lineVertexShaderSourceCode = `
  attribute vec4 a_pos;
  uniform vec4 u_scale;
  void main() {
    gl_Position = a_pos / u_scale * vec4(1, -1, 1, 1) * vec4(2.0, 2.0, 1.0, 1.0) + vec4(-1.0, 1.0, 0.0, 0.0);
  }
  `
  // uniform vec4 u_color;
  const lineFragShaderSourceCode = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
  `

  const getProgram = initializeOnce((/** @type {WebGLRenderingContext} */ gl) => {
    const program = createProgram(
      gl,
      createShader(gl, lineVertexShaderSourceCode, gl.VERTEX_SHADER),
      createShader(gl, lineFragShaderSourceCode, gl.FRAGMENT_SHADER)
    )
    const buffer = gl.createBuffer()
    const attrPos = gl.getAttribLocation(program, 'a_pos')

    gl.useProgram(program)
    
    const width = gl.canvas.width / window.devicePixelRatio
    const height = gl.canvas.height / window.devicePixelRatio
    gl.uniform4f(gl.getUniformLocation(program, 'u_scale'), width, height, 1, 1)

    gl.enableVertexAttribArray(attrPos)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 0, 0)

    return { program, buffer, attrPos }
  })

  /**
   * @param {WebGLRenderingContext} gl
   */
  const render = gl => {
    const { program, buffer } = getProgram(gl)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y2,
    ]), gl.STATIC_DRAW)
    gl.drawArrays(gl.LINES, 0, 2)
  }
  const updateEndPoint = ({ x, y }) => {
    x2 = x
    y2 = y
  }

  return { render, updateEndPoint }
}
