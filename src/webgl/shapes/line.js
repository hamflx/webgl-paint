import { initializeOnce } from "../../utils/hooks"
import { createProgram } from "../common/program"
import { createShader } from "../common/shader"

export const createLineShape = (ctx, { x1, y1, x2, y2 }) => {
  const { foregroundColor, thickness } = ctx

  const render = ({ gl }) => {
    const { program, buffer, attrPos, attrNextPos, attrDir } = getProgram(gl)
    gl.useProgram(program)
    gl.uniform4f(gl.getUniformLocation(program, 'u_color'), ...foregroundColor, 1)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 20, 0)
    gl.vertexAttribPointer(attrNextPos, 2, gl.FLOAT, false, 20, 8)
    gl.vertexAttribPointer(attrDir, 1, gl.FLOAT, false, 20, 16)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1, x2, y2, thickness / 2,
      x1, y1, x2, y2, -thickness / 2,
      x2, y2, x1, y1, thickness / 2,
      x2, y2, x1, y1, -thickness / 2,
    ]), gl.STATIC_DRAW)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  const updateEndPoint = ({ x, y }) => {
    x2 = x
    y2 = y
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
  const attrNextPos = gl.getAttribLocation(program, 'a_next_pos')
  const attrDir = gl.getAttribLocation(program, 'a_dir')

  gl.useProgram(program)

  const width = gl.canvas.width / window.devicePixelRatio
  const height = gl.canvas.height / window.devicePixelRatio
  gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), width, height)

  gl.enableVertexAttribArray(attrPos)
  gl.enableVertexAttribArray(attrNextPos)
  gl.enableVertexAttribArray(attrDir)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  return { program, buffer, attrPos, attrNextPos, attrDir }
})

const lineVertexShaderSourceCode = `
attribute vec2 a_pos;
attribute vec2 a_next_pos;
attribute float a_dir;
uniform vec2 u_scale;
void main() {
  vec2 dir = a_next_pos - a_pos;
  float len = sqrt(dir.x * dir.x + dir.y * dir.y);
  vec2 dir_unit = dir / len;
  vec2 norm = vec2(-dir_unit.y, dir_unit.x) * vec2(a_dir, a_dir);
  vec2 final_pos = a_pos + norm;
  vec2 transform_pos = (a_pos + norm) / u_scale * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
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
