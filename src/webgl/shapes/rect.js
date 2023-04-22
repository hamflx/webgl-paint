import { initializeOnce } from "../../utils/hooks"
import { createProgram } from "../common/program"
import { createShader } from "../common/shader"

export const createRectShape = ({ x1, y1, x2, y2 }) => {
  /**
   * @param {WebGLRenderingContext} gl
   */
  const render = gl => {
    const { program, buffer, attrPos } = getProgram(gl)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 0, 0)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x1, y2,
      x2, y2,
      x2, y1,
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

  gl.useProgram(program)
  
  const width = gl.canvas.width / window.devicePixelRatio
  const height = gl.canvas.height / window.devicePixelRatio
  gl.uniform4f(gl.getUniformLocation(program, 'u_scale'), width, height, 1, 1)

  gl.enableVertexAttribArray(attrPos)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  return { program, buffer, attrPos }
})

const lineVertexShaderSourceCode = `
attribute vec4 a_pos;
uniform vec4 u_scale;
void main() {
  gl_Position = a_pos / u_scale * vec4(2.0, -2.0, 1, 1) + vec4(-1.0, 1.0, 0.0, 0.0);
}
`
const lineFragShaderSourceCode = `
// uniform vec4 u_color;
precision mediump float;
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`
