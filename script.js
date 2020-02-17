// HelloTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n'+
  'uniform mat4 u_ModelMatrix;\n'+
  'uniform mat4 u_ViewMatrix;\n'+
  'uniform mat4 u_ProjMatrix;\n'+
  'varying vec4 v_Color;\n'+
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix *  u_ViewMatrix * a_Position * u_ModelMatrix;\n' +
  '  v_Color = a_Color;\n'+
  '}\n';
// set the position of vertex to the assigned coordinates

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n'+
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
// give the fragment a colour of red

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

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // get the storage locations of u_ViewMatrix and u_ProjMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ViewMatrix || !u_ProjMatrix) { 
    console.log('Failed to get the storage location of u_ViewMatrix and/or u_ProjMatrix');
    return;
  }
  
  var modelMatrix = new Matrix4();
  var viewMatrix = new Matrix4();　// The view matrix
  var projMatrix = new Matrix4();  // The projection matrix

 // calculate the view matrix and projection matrix
  modelMatrix.setTranslate(0, 0, 5);
  // set location of virtual camera
  viewMatrix.setLookAt(0, 0, 5, 0, 0, 0, 0, 1, 0); // where to view the models from
  projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  // Pass the view and projection matrix to u_ViewMatrix, u_ProjMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Draw the rectangle
  
  gl.drawArrays(gl.TRIANGLES, 0, n); // gl.TRIANGLES
  document.onkeydown = function(ev){
    keydown(ev, gl, u_ModelMatrix,n);
  };
  // the model matrix translates a model 
  // Prepare the model matrix for another pair of triangles
  //modelMatrix.setTranslate(-0.75, 0, 0); // Translate 0.75 units along the negative x-axis
  // Modify only the model matrix
  //gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  //gl.drawArrays(gl.TRIANGLES, 0, n);   // Draw the triangles
} 

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Three triangles on the right side
    0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
    1.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 

    0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
    1.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 

    0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    0.25, -1.0,   0.0,  0.4,  0.4,  1.0,
    1.25, -1.0,   0.0,  1.0,  0.4,  0.4, 

    // Three triangles on the left side
   -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
   -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
   -0.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 

   -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
   -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
   -0.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 

   -0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
   -1.25, -1.0,   0.0,  0.4,  0.4,  1.0,
   -0.25, -1.0,   0.0,  1.0,  0.4,  0.4, 
  ]);
  var n = 18;

  // Create a WebGL buffer object (geometry data can be passed to and processed
  // by the vertex and fragment shaders only if they are stored in WebGL buffer
  // object at the first place)
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // Write data into the buffer object (write once and used many times)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
