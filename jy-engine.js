import { MeshData } from "./jy-toybox.js";

export const VertexElementType = {
  FLOAT: Symbol(0),
  UINT8: Symbol(1),
  UINT16: Symbol(2),
};

export const MeshType = {
  TRIANGLE: Symbol(0),
  LINE: Symbol(1),
  POINT: Symbol(2),
};

export class ShaderBuffer {
  #vertShader = null;
  #fragShader = null;
  #program = null;

  constructor(gl_context) {
    this.gl = gl_context;
  }

  setVertexShader(code) {
    this.#vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(this.#vertShader, code);
  }

  setFragmentShader(code) {
    this.#fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(this.#fragShader, code);
  }

  initialize() {
    this.gl.compileShader(this.#vertShader);
    if (!this.gl.getShaderParameter(this.#vertShader, this.gl.COMPILE_STATUS)) {
      console.error(
        "ERROR compiling vertex shader!",
        this.gl.getShaderInfoLog(this.#vertShader)
      );
      return;
    }

    this.gl.compileShader(this.#fragShader);
    if (!this.gl.getShaderParameter(this.#fragShader, this.gl.COMPILE_STATUS)) {
      console.error(
        "ERROR compiling fragment shader!",
        this.gl.getShaderInfoLog(this.#fragShader)
      );
      return;
    }

    this.#program = this.gl.createProgram();
    this.gl.attachShader(this.#program, this.#vertShader);
    this.gl.attachShader(this.#program, this.#fragShader);
    this.gl.linkProgram(this.#program);

    if (!this.gl.getProgramParameter(this.#program, this.gl.LINK_STATUS)) {
      console.error(
        "ERROR linking program!",
        gl.getProgramInfoLog(this.#program)
      );
      return;
    }
    this.gl.validateProgram(this.#program);
    if (!this.gl.getProgramParameter(this.#program, this.gl.VALIDATE_STATUS)) {
      console.error(
        "ERROR validating program!",
        this.gl.getProgramInfoLog(this.#program)
      );
      return;
    }
  }

  updateVec3(id, value) {
    var loc = this.gl.getUniformLocation(this.#program, id);
    this.gl.uniform3fv(loc, this.gl.FALSE, value);
  }
  updateVec4(id, value) {
    var loc = this.gl.getUniformLocation(this.#program, id);
    this.gl.uniform4fv(loc, this.gl.FALSE, value);
  }
  updateMat4(id, value) {
    var loc = this.gl.getUniformLocation(this.#program, id);
    this.gl.uniformMatrix4fv(loc, this.gl.FALSE, value);
  }
  use() {
    this.gl.useProgram(this.#program);
  }
  findAttrLoc(id) {
    return this.gl.getAttribLocation(this.#program, id);
  }
  findUniformLoc(id) {
    return this.gl.getUniformLocation(this.#program, id);
  }
  bindAttr(id, vertexElemCount, vertexElemType, memSize, memOffset) {
    var type;
    switch (vertexElemType) {
      case VertexElementType.FLOAT:
        type = this.gl.FLOAT;
        break;
      case VertexElementType.UINT8:
        type = this.gl.UINT8;
        break;
      case VertexElementType.UINT16:
        type = this.gl.UINT16;
        break;
      default:
        type = this.gl.FLOAT;
    }

    var loc = this.findAttrLoc(id);
    this.gl.vertexAttribPointer(
      loc,
      vertexElemCount,
      type,
      this.gl.FALSE,
      memSize,
      memOffset
    );

    this.gl.enableVertexAttribArray(loc);
  }
}

export class MeshBuffer {
  #meshType = null;
  #vertexBuffer = null;
  #indexBuffer = null;
  #indexSize = 0;
  #vertexData;
  #indexData;
  #world;
  #pso = null;

  constructor(gl_context) {
    this.gl = gl_context;
    this.#world = new Float32Array(16);
    mat4.identity(this.#world);
  }
  setShader(shader) {
    this.#pso = shader;
  }
  setDrawType(type) {
    this.drawType = type;
  }
  setMeshType(type) {
    this.meshType = type;

    switch (type) {
      case MeshType.TRIANGLE:
        this.#meshType = this.gl.TRIANGLES;
        break;
      case MeshType.POINT:
        this.#meshType = this.gl.POINTS;
        break;
      case MeshType.LINE:
        this.#meshType = this.gl.LINES;
        break;
      default:
        this.#meshType = this.gl.TRIANGLES;
    }
  }
  setData(mesh) {
    // var vertex = new Float32Array(vertexData);
    // var index = new Float32Array(indexData);
    // this.#vertexData = vertex;
    // this.#indexData = index;

    this.#vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.#vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      mesh.getVertices(),
      this.gl.STATIC_DRAW
    );

    this.#indexSize = mesh.indicesLength();
    this.#indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      mesh.getIndices(),
      this.gl.STATIC_DRAW
    );
  }
  setPosition(pos) {
    this.#world[12] = pos[0];
    this.#world[13] = pos[1];
    this.#world[14] = pos[2];
    // mat4.translate(this.#world, this.#world, pos);
  }
  render() {
    if (this.#pso) {
      this.#pso.use();
      this.#pso.updateMat4("world", this.#world);
    }
    this.gl.drawElements(
      this.#meshType,
      this.#indexSize,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }
}
