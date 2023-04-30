import { initializeOnce } from "../../utils/hooks"
import { createProgram } from "../common/program"
import { createShader } from "../common/shader"

export const createRectShape = (ctx, { x1, y1, x2, y2 }) => {
  const { backgroundColor, foregroundColor, thickness } = ctx

  /**
   * 
   * @param {{ gl: WebGLRenderingContext }} param0
   */
  const render = ({ gl }) => {
    const { program, buffer, attrPos, uniformColor } = getProgram(gl)
    const xDir = Math.sign(x2 - x1)
    const yDir = Math.sign(y2 - y1)
    gl.useProgram(program)
    gl.uniform4f(uniformColor, ...backgroundColor, 1)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1, x1 + thickness * xDir, y1 + thickness * yDir,
      x1, y2, x1 + thickness * xDir, y2 - thickness * yDir,
      x2, y2, x2 - thickness * xDir, y2 - thickness * yDir,
      x2, y1, x2 - thickness * xDir, y1 + thickness * yDir,
    ]), gl.STATIC_DRAW)

    gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 16, 0)
    gl.uniform4f(uniformColor, ...foregroundColor, 1)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

    if (Math.abs(x2 - x1) > thickness * 2 && Math.abs(y2 - y1) > thickness * 2) {
      gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 16, 8)
      gl.uniform4f(uniformColor, ...backgroundColor, 1)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    }
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
  const uniformColor = gl.getUniformLocation(program, 'u_color')

  gl.useProgram(program)
  
  const width = gl.canvas.width / window.devicePixelRatio
  const height = gl.canvas.height / window.devicePixelRatio
  gl.uniform2f(gl.getUniformLocation(program, 'u_scale'), width, height)

  gl.enableVertexAttribArray(attrPos)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  return { program, buffer, attrPos, uniformColor }
})

const lineVertexShaderSourceCode = `
attribute vec2 a_pos;
uniform vec2 u_scale;
void main() {
  vec2 transform_pos = a_pos / u_scale * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
  gl_Position = vec4(transform_pos, 1, 1);
}
`
const lineFragShaderSourceCode = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`
