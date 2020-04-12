// Directional lighting demo: By Frederick Li
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoords;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoords;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate the vertex position in the world coordinate
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' + 
  '  v_TexCoords = a_TexCoords;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform bool u_UseTextures;\n' +  
  'uniform bool u_UseTVLight;\n' +   // Texture enable/disable flag
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoords;\n' +
  'void main() {\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make its length 1.
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
     // The dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 diffuse;\n' +
  '  vec3 TVdiffuse;\n' +
  '  if (u_UseTextures) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' +
  '  } else {\n' +
  '     diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  }\n' +
  '  if (u_UseTVLight) {\n' +
  '  vec3 TVLightDirection = normalize(normalize(vec3(3.4, 10.0, 80.0)) - v_Position);\n' +
  '  float TVnDotL = max(dot(TVLightDirection, normal), 0.0);\n' +
  '     TVdiffuse = v_Color.rgb * TVnDotL * normalize(vec3(0.0, 0.5, 0.7));\n' +
  '  } ' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient + TVdiffuse, v_Color.a);\n' +
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
  gl.clearColor(0.5, 0.9, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }
  
  var u_UseTVLight = gl.getUniformLocation(gl.program, "u_UseTVLight");
  if (!u_UseTVLight) { 
    console.log('Failed to get the storage location for tv light flag');
    return;
  }
  var u_UseTextures = gl.getUniformLocation(gl.program, "u_UseTextures");
  if (!u_UseTextures) { 
    console.log('Failed to get the storage location for use textures flag');
    return;
  }
  
  var modelMatrix = new Matrix4();

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 2.0, 3.0, 2.5);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0,30.0, 50.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  document.onkeydown = function(ev){ keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTVLight, u_UseTextures); };
  drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures);
}

var MOVE_STEP = 1.0;
var ANGLE_STEP = 3.0;
var g_rotate_angle = 0.0;
var chair_move = 0.0;
var arm_chair_angle = 0.0;
var cabinet_angle = 0.0;
var drawer_move = 0.0;
var use_tv_light = false;

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTVLight, u_UseTextures) {
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
	case 65:
	  if (chair_move < 2.5){
		  chair_move += 0.25;
	  }
	  break;
	case 83:
	  if (chair_move > -2.0){
	    chair_move -= 0.25;
	    
	  }
	  break;
	case 90:
	  if (arm_chair_angle > -30){
		  arm_chair_angle -= 3.0;
	  }
	  break;
	case 88:
	  if (arm_chair_angle < 15){
		  arm_chair_angle += 3.0;
	  }
	  break;
	case 81:
	  if (cabinet_angle < 90) {
		cabinet_angle += 6.0;
	  }
	  break;
	case 87:
	  if (cabinet_angle > 0) {
		cabinet_angle -= 6.0;
	  }
	  break;
	case 79:
	  if (drawer_move < 2.0){
		  drawer_move += 0.25;
	  }
	  break;
	case 80:
	  if (drawer_move > 0.0){
		  drawer_move -= 0.25;
	  }
	  break;
	  
	case 32:
	if (use_tv_light) {
		gl.uniform1i(u_UseTVLight, false);
		use_tv_light = false;
	} else {
		gl.uniform1i(u_UseTVLight, true);
		use_tv_light = true;
	}
		
	  // start animations
  }
  
  // Draw the robot arm
  drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures);
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


// Colors
 
  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ]);
  
  var texCoords = new Float32Array([
    1.0, 1.0,    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0,    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0,    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0,    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0   // v4-v7-v6-v5 back
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
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;

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

function initArrayBuffer(gl, attribute, data, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
  // Element size
  var FSIZE = data.BYTES_PER_ELEMENT;

  // Assign the buffer object to the attribute variable

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, FSIZE * num, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures) {
	
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, 7.0,g_rotate_angle+0.0);
  draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, -10.0,g_rotate_angle+275.0);
  draw_rug(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 10.0, 0.0, 10.0,g_rotate_angle+0.0);
  draw_cabinet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -2.0, 0.0, -25.0,g_rotate_angle+215.0);
  draw_tv(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 25.0, 3.2, -2.0,g_rotate_angle+305.0);
  draw_arm_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -16.0, 0.0, 0.0,g_rotate_angle+90);
  draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 16.0, 0.0, 0.0,g_rotate_angle+0.0);
  draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, 22.0,g_rotate_angle+0.0);
  draw_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -3.0, 0.0, -15.0,g_rotate_angle+90.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -17.5-chair_move, 0.0, 0.0,g_rotate_angle+0.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -17.5-chair_move, 0.0, -4.0,g_rotate_angle+0.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 8.5-chair_move, 0.0, 2.0,g_rotate_angle+180.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 8.5-chair_move, 0.0, -2.0,g_rotate_angle+180.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 2.0, 0.0, -13.0,g_rotate_angle+0.0,1.5);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 7.0, 0.0, -13.0,g_rotate_angle+0.0,1.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 12.0, 0.0, -13.0,g_rotate_angle+0.0,2.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 17.0, 0.0, -13.0,g_rotate_angle+0.0,drawer_move);
  draw_pool_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -19.0, 0.0, 13.0,g_rotate_angle+0.0);
  draw_walls_and_floor(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, 0.0,g_rotate_angle+0.0);

}

function draw_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {

  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+4.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+8.0, y+0.0, z+4.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+8.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+4.0, y+3.0, z+2.0);
  drawBox(gl, n, 9.0, 0.5, 5.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
}

function draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
	
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+2.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.0, y+0.0, z+2.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.0, y+2.5, z+1.0);
  drawBox(gl, n, 2.5, 0.1, 2.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.25, y+2.5, z+1.0);
  g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.1, 3.5, 2.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "");
}

function draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
	
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 4.0, 1.5, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.5, 4.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z-4.0);
  drawBox(gl, n, 4.5, 1.25, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z+4.0);
  drawBox(gl, n, 4.5, 1.25, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "");
  
}

function draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 2.0, 0.25, 2.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.6,0.6, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 10.0, 0.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.6,0.6, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+7.5, z+0.0);
  drawBox(gl, n, 1.25, 2.0, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,1.0,1.0, "");
}

function draw_tv(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 2.0, 0.25, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 1.5, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z+0.0);
  drawBox(gl, n, 0.5, 3.0, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.25, y+1.5, z+0.0);
  drawBox(gl, n, 0.5, 4.0, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  if (use_tv_light){
	  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
      g_modelMatrix.translate(x-0.50, y+2.0, z+0.0);
      drawBox(gl, n, 0.1, 3.0, 5.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,1.0,1.0, "");
  }
}

function draw_rug(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 6.0, 0.05, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.0,0.6,1.0, "");
  
}

function draw_arm_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 3.5, 2.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.75, y+2.0, z+0.0);
  drawBox(gl, n, 1.0, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+2.0, z+0.0);
  drawBox(gl, n, 1.0, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+2.0, z-1.0);
  g_modelMatrix.rotate(-15.0+arm_chair_angle,1.0,0.0,0.0);
  drawBox(gl, n, 3.5, 4.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "");
}

function draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate, drawer_translate) { 
	g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 3.5, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.75, y+0.0, z+0.0);
  drawBox(gl, n, 0.10, 10.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+0.0, z+0.0);
  drawBox(gl, n, 0.10, 10.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z-1.5);
  g_modelMatrix.rotate(90.0, 0.0,1.0,0.0);
  drawBox(gl, n, 0.10, 10.0, 3.4, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+9.0, z+0.0);
  drawBox(gl, n, 3.5, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+7.0, z+0.0);
  drawBox(gl, n, 3.5, 0.10, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+5.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.2, z+0.0+drawer_translate);
  drawBox(gl, n, 3.5, 0.1, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.2, z+1.6+drawer_translate);
  drawBox(gl, n, 3.5, 1.8, 0.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.65, y+1.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.65, y+1.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+5.2, z+0.0+drawer_translate);
  drawBox(gl, n, 3.5, 0.1, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+5.2, z+1.6+drawer_translate);
  drawBox(gl, n, 3.5, 1.8, 0.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.65, y+5.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.65, y+5.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "");
  
}

function draw_cabinet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) { 
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z-1.5);
  g_modelMatrix.rotate(90.0, 1.0,0.0,0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-3.5, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+3.5, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+0.0, z+1.50);
  g_modelMatrix.rotate(cabinet_angle, 1.0, 0.0, 0.0);
  drawBox(gl, n, 3.25, 3.25, 0.15, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "");
  
}

function draw_pool_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) { 
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+5.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.0, y+0.0, z+5.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z+2.5);
  drawBox(gl, n, 12.0, 1.0, 7.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.0,0.6,0.0, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z-1.0);
  g_modelMatrix.rotate(-15.0,1.0,0.0,0.0);
  drawBox(gl, n, 12.0, 2.0, 0.75, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z+6.0);
  g_modelMatrix.rotate(15.0,1.0,0.0,0.0);
  drawBox(gl, n, 12.0, 2.0, 0.75, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.75, y+3.0, z+2.5);
  g_modelMatrix.rotate(15.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.75, 2.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.75, y+3.0, z+2.5);
  g_modelMatrix.rotate(-15.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.75, 2.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "");

}

function draw_walls_and_floor(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate){
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.5, y+0.0, z+5.0);
  drawBox(gl, n, 50.0, 0.0, 45.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.76,0.76,0.64, "");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.5, y+0.0, z-17.5);
  drawBox(gl, n, 50.0, 12.0, 0.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.95,0.95,0.95, "texture2");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-27.5, y+0.0, z+5.0);
  drawBox(gl, n, 0.1, 12.0, 45.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.95,0.95,0.95, "texture1");
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
function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, r, g, b, texture_id) {
  pushMatrix(g_modelMatrix);   // Save the model matrix
    var colors = new Float32Array([
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v1-v2-v3 front
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v0-v3-v4-v5 right
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v0-v5-v6-v1 up
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v1-v6-v7-v2 left
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v7-v4-v3-v2 down
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v4-v7-v6-v5 back
 ]);
 
    if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;
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
	
	if (texture_id != ""){
		var Cubetexture = gl.createTexture();   // Create a texture object
		if (!Cubetexture) {
		  console.log('Failed to create the texture object');
		  return false;
		}

	  // Get the storage location of u_Sampler
		var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
		if (!u_Sampler) {
		  console.log('Failed to get the storage location of u_Sampler');
		  return false;
		}
		gl.uniform1i(u_UseTextures, true);			
		loadTexAndDraw(gl, n, Cubetexture, u_Sampler, texture_id);
	} else {
		gl.uniform1i(u_UseTextures, false);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	}
	
  
	g_modelMatrix = popMatrix();   // Retrieve the model matrix
}

function loadTexAndDraw(gl, n, texture, u_Sampler, texture_id) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, document.getElementById(texture_id));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Assign u_Sampler to TEXTURE0
  gl.uniform1i(u_Sampler, 0);

  // Draw the textured cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
