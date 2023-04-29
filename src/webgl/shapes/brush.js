import { initializeOnce } from "../../utils/hooks"
import { createProgram } from "../common/program"
import { createShader } from "../common/shader"

export const createBrushShape = (ctx, { x, y }) => {
  const { foregroundColor, thickness } = ctx
  const pointList = [{ x, y }]

  /**
   * @param {{gl: WebGLRenderingContext}} gl
   */
  const render = ({ gl }) => {
    if (pointList.length < 2) {
      return
    }

    const { program, buffer, attrPos, attrPrevPos, attrNextPos, attrDir } = getProgram(gl)
    gl.useProgram(program)
    gl.uniform4f(gl.getUniformLocation(program, 'u_color'), ...foregroundColor, 1)

    const unitSize = 7
    const unitBytes = unitSize * 4
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, unitBytes, 0)
    gl.vertexAttribPointer(attrPrevPos, 2, gl.FLOAT, false, unitBytes, 8)
    gl.vertexAttribPointer(attrNextPos, 2, gl.FLOAT, false, unitBytes, 16)
    gl.vertexAttribPointer(attrDir, 1, gl.FLOAT, false, unitBytes, 24)

    const itemSize = unitSize * 2
    const data = new Float32Array(pointList.length * itemSize)
    for (let i = 0; i < pointList.length; i++) {
      const curr = pointList[i]
      const prev = pointList[i - 1] ?? { x: curr.x - (pointList[i + 1].x - curr.x), y: curr.y - (pointList[i + 1].y - curr.y) }
      const next = pointList[i + 1] ?? { x: curr.x - (pointList[i - 1].x - curr.x), y: curr.y - (pointList[i - 1].y - curr.y) }
      data[i * itemSize + 0] = curr.x
      data[i * itemSize + 1] = curr.y
      data[i * itemSize + 2] = prev.x
      data[i * itemSize + 3] = prev.y
      data[i * itemSize + 4] = next.x
      data[i * itemSize + 5] = next.y
      data[i * itemSize + 6] = thickness
      data[i * itemSize + 7] = curr.x
      data[i * itemSize + 8] = curr.y
      data[i * itemSize + 9] = prev.x
      data[i * itemSize + 10] = prev.y
      data[i * itemSize + 11] = next.x
      data[i * itemSize + 12] = next.y
      data[i * itemSize + 13] = thickness * -1
    }
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointList.length * 2)
  }

  const updateEndPoint = ({ x, y }) => {
    const last = pointList[pointList.length - 1]
    if (last && Math.abs(last.x - x) < 2 && Math.abs(last.y - y) < 2) {
      return
    }
    pointList.push({ x, y })
  }

  return { render, updateEndPoint }
}

const getProgram = initializeOnce((/** @type {WebGLRenderingContext} */ gl) => {
  const program = createProgram(
    gl,
    createShader(gl, lineVertexShaderSourceCode, gl.VERTEX_SHADER),
    createShader(gl, lineFragShaderSourceCode, gl.FRAGMENT_SHADER)
  )
  const buffer = gl.createBuffer()
  const attrPos = gl.getAttribLocation(program, 'a_pos')
  const attrPrevPos = gl.getAttribLocation(program, 'a_prev_pos')
  const attrNextPos = gl.getAttribLocation(program, 'a_next_pos')
  const attrDir = gl.getAttribLocation(program, 'a_dir')

  gl.useProgram(program)

  const width = gl.canvas.width / window.devicePixelRatio
  const height = gl.canvas.height / window.devicePixelRatio
  gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), width, height)

  gl.enableVertexAttribArray(attrPos)
  gl.enableVertexAttribArray(attrPrevPos)
  gl.enableVertexAttribArray(attrNextPos)
  gl.enableVertexAttribArray(attrDir)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  return { program, buffer, attrPos, attrPrevPos, attrNextPos, attrDir }
})

const lineVertexShaderSourceCode = `
attribute vec2 a_pos;
attribute vec2 a_prev_pos;
attribute vec2 a_next_pos;
attribute float a_dir;
uniform vec2 u_scale;

vec2 transform_coord2(vec2 coord) {
  return coord / u_scale * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
}

void main() {
  vec2 vec_a = a_pos - a_prev_pos;
  vec2 unit_a = normalize(vec_a);
  vec2 vec_b = a_next_pos - a_pos;
  vec2 unit_b = normalize(vec_b);
  float w = a_dir;
  float cos_theta = dot(vec_a, vec_b) / (length(vec_a) * length(vec_b));
  if (cos_theta < -1.0) {
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
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`
