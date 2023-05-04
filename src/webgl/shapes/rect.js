import { initializeOnce } from "../../utils/hooks"
import { COLOR_SIZE } from "../common/colors"
import { createProgram } from "../common/program"
import { createShader } from "../common/shader"
import { PaintTool } from "../common/tools"

/**
 * @param {WebGLRenderingContext} gl
 */
export const createRectTool = gl => {
  const verticesBuffer = gl.createBuffer()
  const indicesBuffer = gl.createBuffer()

  const unitSize = 6 + COLOR_SIZE
  const unitBytes = unitSize * 4

  const draw = (vertices, indices) => {
    const { program, attrPos, attrThickness, attrOpposite, attrColor } = getProgram(gl)

    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, false, unitBytes, 0)
    gl.vertexAttribPointer(attrOpposite, 2, gl.FLOAT, false, unitBytes, 12)
    gl.vertexAttribPointer(attrThickness, 1, gl.FLOAT, false, unitBytes, 20)
    gl.vertexAttribPointer(attrColor, 3, gl.FLOAT, false, unitBytes, 6 * 4)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
  }
  return { draw, type: PaintTool.Rectangle }
}

export const createRectShape = (ctx, { x1, y1, x2, y2 }) => {
  const { backgroundColor, foregroundColor, thickness } = ctx

  const updateEndPoint = ({ x, y }) => {
    x2 = x
    y2 = y
  }

  /**
   * @param {Array<number>} vertices
   * @param {Array<number>} indices
   * @param {number} offset
   * @param {number} zIndex
   */
    const prepare = (vertices, indices, offset, zIndex) => {
      vertices.push(
        x1, y1, zIndex, x2, y2, thickness, ...backgroundColor,
        x1, y2, zIndex, x2, y1, thickness, ...backgroundColor,
        x2, y2, zIndex, x1, y1, thickness, ...backgroundColor,
        x2, y1, zIndex, x1, y2, thickness, ...backgroundColor,
        x1, y1, zIndex, x1, y1, 0, ...foregroundColor,
        x1, y2, zIndex, x1, y2, 0, ...foregroundColor,
        x2, y2, zIndex, x2, y2, 0, ...foregroundColor,
        x2, y1, zIndex, x2, y1, 0, ...foregroundColor,
      )
      indices.push(
        offset, offset + 1, offset + 2,
        offset, offset + 2, offset + 3,
        offset + 4, offset + 5, offset + 6,
        offset + 4, offset + 6, offset + 7,
      )
      return { count: 8 }
    }

  return { type: PaintTool.Rectangle, prepare, updateEndPoint }
}

const getProgram = initializeOnce((/** @type {WebGLRenderingContext} */ gl) => {
  const program = createProgram(
    gl,
    createShader(gl, lineVertexShaderSourceCode, gl.VERTEX_SHADER),
    createShader(gl, lineFragShaderSourceCode, gl.FRAGMENT_SHADER)
  )
  const attrPos = gl.getAttribLocation(program, 'a_pos')
  const attrThickness = gl.getAttribLocation(program, 'a_thickness')
  const attrOpposite = gl.getAttribLocation(program, 'a_opposite')
  const attrColor = gl.getAttribLocation(program, 'a_color')

  gl.useProgram(program)
  
  const width = gl.canvas.width / window.devicePixelRatio
  const height = gl.canvas.height / window.devicePixelRatio
  gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), width, height)

  gl.enableVertexAttribArray(attrPos)
  gl.enableVertexAttribArray(attrThickness)
  gl.enableVertexAttribArray(attrOpposite)
  gl.enableVertexAttribArray(attrColor)

  return { program, attrPos, attrThickness, attrOpposite, attrColor }
})

const lineVertexShaderSourceCode = `
attribute vec3 a_pos;
attribute vec2 a_opposite;
attribute float a_thickness;
attribute vec4 a_color;
uniform vec2 u_scale;
varying vec4 v_color;
void main() {
  v_color = a_color;

  vec2 diff = a_opposite - a_pos.xy;
  vec2 abs_diff = abs(diff);
  vec2 max_thickness = min(abs_diff, a_thickness);
  vec2 dx = sign(diff) * max_thickness;
  vec2 transform_pos = (a_pos.xy + dx) / u_scale * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
  gl_Position = vec4(transform_pos, a_pos.z, 1);
}
`
const lineFragShaderSourceCode = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}
`
