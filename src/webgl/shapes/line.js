import { initializeOnce } from "../../utils/hooks"
import { COLOR_SIZE } from "../common/colors"
import { createProgram } from "../common/program"
import { createShader } from "../common/shader"
import { PaintTool } from "../common/tools"

/**
 * @param {WebGLRenderingContext} gl
 */
export const createLineTool = gl => {
  const verticesBuffer = gl.createBuffer()
  const indicesBuffer = gl.createBuffer()

  const unitSize = 5 + COLOR_SIZE
  const unitBytes = unitSize * 4

  const draw = (vertices, indices) => {
    const { program, attrPos, attrNextPos, attrDir, attrColor } = getProgram(gl)

    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, unitBytes, 0)
    gl.vertexAttribPointer(attrNextPos, 2, gl.FLOAT, false, unitBytes, 8)
    gl.vertexAttribPointer(attrDir, 1, gl.FLOAT, false, unitBytes, 16)
    gl.vertexAttribPointer(attrColor, 3, gl.FLOAT, false, unitBytes, 20)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
  }
  return { draw, type: PaintTool.Line }
}

export const createLineShape = (ctx, { x1, y1, x2, y2 }) => {
  const { foregroundColor, thickness } = ctx

  const updateEndPoint = ({ x, y }) => {
    x2 = x
    y2 = y
  }

  /**
   * @param {Array<number>} vertices
   * @param {Array<number>} indices
   * @param {number} offset
   */
  const prepare = (vertices, indices, offset) => {
    vertices.push(
      x1, y1, x2, y2, thickness, ...foregroundColor,
      x1, y1, x2, y2, -thickness, ...foregroundColor,
      x2, y2, x1, y1, thickness, ...foregroundColor,
      x2, y2, x1, y1, -thickness, ...foregroundColor
    )
    indices.push(
      offset, offset + 1, offset + 2,
      offset + 0, offset + 2, offset + 3
    )
    return { count: 4 }
  }

  return { type: PaintTool.Line, prepare, updateEndPoint }
}

const getProgram = initializeOnce((/** @type {WebGLRenderingContext} */ gl) => {
  const program = createProgram(
    gl,
    createShader(gl, lineVertexShaderSourceCode, gl.VERTEX_SHADER),
    createShader(gl, lineFragShaderSourceCode, gl.FRAGMENT_SHADER)
  )
  const attrPos = gl.getAttribLocation(program, 'a_pos')
  const attrNextPos = gl.getAttribLocation(program, 'a_next_pos')
  const attrDir = gl.getAttribLocation(program, 'a_dir')
  const attrColor = gl.getAttribLocation(program, 'a_color')

  gl.useProgram(program)

  const width = gl.canvas.width / window.devicePixelRatio
  const height = gl.canvas.height / window.devicePixelRatio
  gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), width, height)

  gl.enableVertexAttribArray(attrPos)
  gl.enableVertexAttribArray(attrNextPos)
  gl.enableVertexAttribArray(attrDir)
  gl.enableVertexAttribArray(attrColor)

  return { program, attrPos, attrNextPos, attrDir, attrColor }
})

const lineVertexShaderSourceCode = `
attribute vec2 a_pos;
attribute vec2 a_next_pos;
attribute float a_dir;
attribute vec4 a_color;
uniform vec2 u_scale;
varying vec4 v_color;
void main() {
  v_color = a_color;

  vec2 dir = a_next_pos - a_pos;
  float len = sqrt(dir.x * dir.x + dir.y * dir.y);
  vec2 dir_unit = dir / len;
  vec2 norm = vec2(-dir_unit.y, dir_unit.x) * vec2(a_dir, a_dir) / 2.0;
  vec2 final_pos = a_pos + norm;
  vec2 transform_pos = (a_pos + norm) / u_scale * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
  gl_Position = vec4(transform_pos.xy, 1, 1);
}
`
const lineFragShaderSourceCode = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}
`
