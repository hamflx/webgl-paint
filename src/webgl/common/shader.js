
/**
 * @param {WebGLRenderingContext} gl
 * @param {string} source
 * @param {number} type
 * @returns {WebGLShader}
 */
export const createShader = (gl, source, type) => {
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
