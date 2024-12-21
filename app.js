import {
  ShaderBuffer,
  MeshBuffer,
  MeshType,
  VertexElementType,
} from "./jy-engine.js";
import { MakeCube } from "./jy-toybox.js";
import { Camera } from "./jy-camera.js";

var vertexShaderSource = `
precision mediump float;
attribute vec3 vertPosition;
attribute vec3 vertColor;
varying vec3 fragColor;

uniform mat4 world;
uniform mat4 view;
uniform mat4 proj;

void main()
{
  fragColor = vertColor;
  gl_Position = proj * view * world * vec4(vertPosition, 1.0);
}
`;

var fragShaderSource = `
precision mediump float;
varying vec3 fragColor;

void main()
{
  gl_FragColor = vec4(fragColor, 1.0);
}
`;

var gl;

var initDemo = function () {
  console.log("This is working");

  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL not supported, falling back on experimental");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your brower does not support WebGL");
  }

  var cubeShader = new ShaderBuffer(gl);
  cubeShader.setVertexShader(vertexShaderSource);
  cubeShader.setFragmentShader(fragShaderSource);
  cubeShader.initialize();

  var cubeBuffer = new MeshBuffer(gl);
  cubeBuffer.setMeshType(MeshType.TRIANGLE);
  cubeBuffer.setShader(cubeShader);
  cubeBuffer.setData(MakeCube());

  var mainCamera = new Camera(canvas, [20, 0, 0], [0, 0, 0]);

  cubeShader.use();
  cubeShader.bindAttr(
    "vertPosition",
    3,
    VertexElementType.FLOAT,
    Float32Array.BYTES_PER_ELEMENT * 6,
    Float32Array.BYTES_PER_ELEMENT * 0
  );
  cubeShader.bindAttr(
    "vertColor",
    3,
    VertexElementType.FLOAT,
    Float32Array.BYTES_PER_ELEMENT * 6,
    Float32Array.BYTES_PER_ELEMENT * 3
  );

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(
    projMatrix,
    glMatrix.toRadian(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000.0
  );

  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var angle = 0;

  // 1. 초기 세팅
  {
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
  }
  // 2. 랜더링 루프
  var loop = function () {
    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    mat4.rotate(xRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(yRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    cubeShader.use();
    cubeShader.updateMat4("world", worldMatrix);
    cubeShader.updateMat4("view", mainCamera.view);
    cubeShader.updateMat4("proj", projMatrix);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    cubeBuffer.setPosition([0.0, 0, 0]);
    cubeBuffer.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

var canvas = document.getElementById("canvas");
initDemo();
