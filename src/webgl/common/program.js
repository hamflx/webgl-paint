/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragShader
 * @returns {WebGLProgram}
 */
export const createProgram = (gl, vertexShader, fragShader) => {
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
