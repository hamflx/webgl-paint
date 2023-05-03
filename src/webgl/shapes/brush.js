import { initializeOnce } from "../../utils/hooks"
import { createProgram } from "../common/program"
import { createShader } from "../common/shader"
import { PaintTool } from "../common/tools"

/**
 * @param {WebGLRenderingContext} gl
 */
export const createBrushTool = gl => {
  const verticesBuffer = gl.createBuffer()
  const indicesBuffer = gl.createBuffer()

  const unitSize = 10
  const unitBytes = unitSize * 4

  const draw = (vertices, indices) => {
    const { program, attrPos, attrPrevPos, attrNextPos, attrDir, attrColor } = getProgram(gl)

    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, unitBytes, 0)
    gl.vertexAttribPointer(attrPrevPos, 2, gl.FLOAT, false, unitBytes, 8)
    gl.vertexAttribPointer(attrNextPos, 2, gl.FLOAT, false, unitBytes, 16)
    gl.vertexAttribPointer(attrDir, 1, gl.FLOAT, false, unitBytes, 24)
    gl.vertexAttribPointer(attrColor, 3, gl.FLOAT, false, unitBytes, 28)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
  }
  return { draw }
}

export const createBrushShape = (ctx, { x, y }) => {
  const { foregroundColor, thickness } = ctx
  const pointList = [{ x, y }]

  const updateEndPoint = ({ x, y }) => {
    const last = pointList[pointList.length - 1]
    if (last && Math.abs(last.x - x) < 2 && Math.abs(last.y - y) < 2) {
      return
    }
    pointList.push({ x, y })
  }

  /**
   * @param {Array<number>} vertices
   * @param {Array<number>} indices
   * @param {number} offset
   */
  const prepare = (vertices, indices, offset) => {
    let count = 0
    if (pointList.length >= 2) {
      for (let i = 0; i < pointList.length; i++) {
        const curr = pointList[i]
        const prev = pointList[i - 1] ?? { x: curr.x - (pointList[i + 1].x - curr.x), y: curr.y - (pointList[i + 1].y - curr.y) }
        const next = pointList[i + 1] ?? { x: curr.x - (pointList[i - 1].x - curr.x), y: curr.y - (pointList[i - 1].y - curr.y) }
        vertices.push(
          curr.x,
          curr.y,
          prev.x,
          prev.y,
          next.x,
          next.y,
          thickness,
          ...foregroundColor,
          curr.x,
          curr.y,
          prev.x,
          prev.y,
          next.x,
          next.y,
          thickness * -1,
          ...foregroundColor
        )
        if (i > 0) {
          indices.push(
            offset + i * 2 - 2,
            offset + i * 2 - 1,
            offset + i * 2,
            offset + i * 2 - 1,
            offset + i * 2,
            offset + i * 2 + 1
          )
        }
        count += 2
      }
    }
    return { count }
  }

  return { type: PaintTool.Brush, prepare, updateEndPoint }
}

const getProgram = initializeOnce((/** @type {WebGLRenderingContext} */ gl) => {
  const program = createProgram(
    gl,
    createShader(gl, lineVertexShaderSourceCode, gl.VERTEX_SHADER),
    createShader(gl, lineFragShaderSourceCode, gl.FRAGMENT_SHADER)
  )
  const attrPos = gl.getAttribLocation(program, 'a_pos')
  const attrPrevPos = gl.getAttribLocation(program, 'a_prev_pos')
  const attrNextPos = gl.getAttribLocation(program, 'a_next_pos')
  const attrDir = gl.getAttribLocation(program, 'a_dir')
  const attrColor = gl.getAttribLocation(program, 'a_color')

  gl.useProgram(program)

  const width = gl.canvas.width / window.devicePixelRatio
  const height = gl.canvas.height / window.devicePixelRatio
  gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), width, height)

  gl.enableVertexAttribArray(attrPos)
  gl.enableVertexAttribArray(attrPrevPos)
  gl.enableVertexAttribArray(attrNextPos)
  gl.enableVertexAttribArray(attrDir)
  gl.enableVertexAttribArray(attrColor)

  return { program, attrPos, attrPrevPos, attrNextPos, attrDir, attrColor }
})

const lineVertexShaderSourceCode = `
attribute vec2 a_pos;
attribute vec2 a_prev_pos;
attribute vec2 a_next_pos;
attribute float a_dir;
attribute vec4 a_color;
varying vec4 v_color;
uniform vec2 u_scale;

vec2 transform_coord2(vec2 coord) {
  return coord / u_scale * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
}

void main() {
  v_color = a_color;

  vec2 vec_a = a_pos - a_prev_pos;
  vec2 unit_a = normalize(vec_a);
  vec2 vec_b = a_next_pos - a_pos;
  vec2 unit_b = normalize(vec_b);
  float w = a_dir;
  float cos_theta = dot(vec_a, vec_b) / (length(vec_a) * length(vec_b));
  if (cos_theta > -0.999) {
    w = a_dir * inversesqrt((1.0 + cos_theta) / 2.0);
  }
  vec2 dir_unit = normalize((unit_a + unit_b) * mat2(0, -1, 1, 0));
  vec2 norm = dir_unit * w;
  vec2 final_pos = a_pos + norm;
  vec2 transform_pos = transform_coord2(final_pos);
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
