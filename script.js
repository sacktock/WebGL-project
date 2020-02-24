// Directional lighting demo: By Frederick Li
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  // Shading calculation to make the arm look three-dimensional
  '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
  '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +  // Robot color
  '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(color.rgb * nDotL + vec3(0.15), color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_MvpMatrix || !u_NormalMatrix) {
    console.log('Failed to get the storage location');
    return;
  }

  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0,30.0, 50.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  document.onkeydown = function(ev){ keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); };
  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

var MOVE_STEP = 1.0;
var ANGLE_STEP = 3.0;
var g_rotate_angle = 0.0;

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  var x_View_Pos = 0.0;
  var y_View_Pos = 0.0;
  var z_View_Pos = 0.0;
  switch (ev.keyCode) {
    case 40: 
      viewProjMatrix.lookAt(0.0,0.0, MOVE_STEP, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 38: 
      viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.0,0.0, MOVE_STEP, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 39: 
      g_rotate_angle -= ANGLE_STEP;
      break;
    case 37: 
      g_rotate_angle += ANGLE_STEP;
      break;
  }
  
  // Draw the robot arm
  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  // Coordinates（Cube which length of one side is 1 with the origin on the center of the bottom)
  var vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
  ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
	
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 7.0,g_rotate_angle+0.0);
  draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, -10.0,g_rotate_angle+275.0);
  draw_rug(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 10.0, 0.0, 10.0,g_rotate_angle+0.0);
  draw_cabinet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -2.0, 0.0, -25.0,g_rotate_angle+215.0);
  draw_tv(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 25.0, 3.2, -2.0,g_rotate_angle+305.0);
  draw_arm_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -16.0, 0.0, 0.0,g_rotate_angle+90);
  draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 16.0, 0.0, 0.0,g_rotate_angle+0.0);
  draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 22.0,g_rotate_angle+0.0);
  draw_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -3.0, 0.0, -15.0,g_rotate_angle+90.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -17.5, 0.0, 0.0,g_rotate_angle+0.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -17.5, 0.0, -4.0,g_rotate_angle+0.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 8.5, 0.0, 2.0,g_rotate_angle+180.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 8.5, 0.0, -2.0,g_rotate_angle+180.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 2.0, 0.0, -13.0,g_rotate_angle+0.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 7.0, 0.0, -13.0,g_rotate_angle+0.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 12.0, 0.0, -13.0,g_rotate_angle+0.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 17.0, 0.0, -13.0,g_rotate_angle+0.0);
  draw_pool_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -19.0, 0.0, 13.0,g_rotate_angle+0.0);
}

function draw_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {

  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+4.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+8.0, y+0.0, z+4.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+8.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+4.0, y+3.0, z+2.0);
  drawBox(gl, n, 9.0, 0.5, 5.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
	
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+2.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.0, y+0.0, z+2.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.0, y+2.5, z+1.0);
  drawBox(gl, n, 2.5, 0.1, 2.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.25, y+2.5, z+1.0);
  g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.1, 3.5, 2.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
	
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 4.0, 1.5, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.5, 4.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z-4.0);
  drawBox(gl, n, 4.5, 1.25, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z+4.0);
  drawBox(gl, n, 4.5, 1.25, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
}

function draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 2.0, 0.25, 2.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 10.0, 0.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+7.5, z+0.0);
  drawBox(gl, n, 1.25, 2.0, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function draw_tv(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 2.0, 0.25, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 1.5, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z+0.0);
  drawBox(gl, n, 0.5, 3.0, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.25, y+1.5, z+0.0);
  drawBox(gl, n, 0.5, 4.0, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function draw_rug(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 6.0, 0.05, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
}

function draw_arm_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) {
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 3.5, 2.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.75, y+2.0, z+0.0);
  drawBox(gl, n, 1.0, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+2.0, z+0.0);
  drawBox(gl, n, 1.0, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+2.0, z-1.0);
  g_modelMatrix.rotate(-15.0,1.0,0.0,0.0);
  drawBox(gl, n, 3.5, 4.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) { 
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 3.5, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.75, y+0.0, z+0.0);
  drawBox(gl, n, 0.10, 10.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+0.0, z+0.0);
  drawBox(gl, n, 0.10, 10.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z-1.5);
  g_modelMatrix.rotate(90.0, 0.0,1.0,0.0);
  drawBox(gl, n, 0.10, 10.0, 3.4, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+9.0, z+0.0);
  drawBox(gl, n, 3.5, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+7.0, z+0.0);
  drawBox(gl, n, 3.5, 0.10, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+5.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function draw_cabinet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) { 
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z-1.5);
  g_modelMatrix.rotate(90.0, 1.0,0.0,0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-3.5, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+3.5, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+0.0, z+1.50);
  drawBox(gl, n, 3.25, 3.25, 0.15, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.0, y+1.5, z+1.65);
  drawBox(gl, n, 0.2, 0.2, 0.2, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
}

function draw_pool_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, y_rotate) { 
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+5.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.0, y+0.0, z+5.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z+2.5);
  drawBox(gl, n, 12.0, 1.0, 7.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z-1.0);
  g_modelMatrix.rotate(-15.0,1.0,0.0,0.0);
  drawBox(gl, n, 12.0, 2.0, 0.75, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z+6.0);
  g_modelMatrix.rotate(15.0,1.0,0.0,0.0);
  drawBox(gl, n, 12.0, 2.0, 0.75, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.5, y+3.0, z+2.5);
  g_modelMatrix.rotate(15.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.75, 2.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.5, y+3.0, z+2.5);
  g_modelMatrix.rotate(-15.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.75, 2.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

// Draw rectangular solid
function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  pushMatrix(g_modelMatrix);   // Save the model matrix
    // Scale a cube and draw
    g_modelMatrix.scale(width, height, depth);
    // Calculate the model view project matrix and pass it to u_MvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // Draw
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  g_modelMatrix = popMatrix();   // Retrieve the model matrix
}
