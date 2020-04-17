// Vertex shader 
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoords;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    
  'uniform mat4 u_NormalMatrix;\n' +   
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoords;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  // calculate world coordinate
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' + 
  '  v_TexCoords = a_TexCoords;\n' +
  '}\n';

// Fragment shader 
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform bool u_UseTextures;\n' +  // texture flag
  'uniform bool u_UseTVLight;\n' + // TV lighting effect flag
  'uniform bool u_IsLight;\n' +   // Fragment is a light source flag
  'uniform vec3 u_LightColor;\n' +     // light colour
  'uniform vec3 u_LightPosition;\n' +  // coordinate of light source
  'uniform vec3 u_AmbientLight;\n' +   // ambient light colour
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoords;\n' +
  'void main() {\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
     // use the light source point to calculate the direction of the light
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
     // calulate the dot product of the light direction and normal vector
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  '  vec3 diffuse;\n' +
  '  vec3 TVdiffuse;\n' +
  '  vec3 ambient;\n'+
  '  if (u_UseTextures) {\n' +
	// calculate the diffuse reflection and ambient colour using textures
  '     vec4 TexColor = texture2D(u_Sampler, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' +
  '		ambient = u_AmbientLight * TexColor.rgb;\n'+
  '  } else {\n' +
  // calculate the diffuse reflection and ambient colour using vertex colour
  '     diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '     vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  }\n' +
  '  if (u_UseTVLight) {\n' +
  // us the TV lighting coordinate to calculate the lighting direction
  '  	vec3 TVLightDirection = normalize(normalize(vec3(4.0, 3.0, -5.5)) - v_Position);\n' +
  // calculate the dot product of the TV light direction and the normal vector
  '  	float TVnDotL = max(dot(TVLightDirection, normal), 0.0);\n' +
    '   if (u_UseTextures) {\n' +
	// calculate the TV diffuse reflection using textures
  '     	vec4 TexColor = texture2D(u_Sampler, v_TexCoords);\n' +
			// use 0.0 0.5 0.7 as the blue light emmited from the TV
  '     	TVdiffuse = TexColor.rgb * TVnDotL * normalize(vec3(0.0, 0.5, 0.7));\n' +
  '  	} else {\n' +
  // calculate the TV diffuse reflection using vertex colour
  '     	TVdiffuse = v_Color.rgb * TVnDotL * normalize(vec3(0.0, 0.5, 0.7));\n' +
  '  	}\n' +
  '  }\n ' +
  '  if (u_IsLight) {\n' + 
		// if fragment is a light source use the full texture colour or white
  '  	if (u_UseTextures) {\n' +
  '			vec4 TexColor = texture2D(u_Sampler, v_TexCoords);\n' +
  '    		gl_FragColor = TexColor;\n' +
  '		} else {\n'+
  '    		gl_FragColor = vec4(1.0,1.0,1.0,1.0);\n'+
  '		}\n'+
  '  } else {\n'+
		// other wise use the diffuse reflection and ambient lighting
  '    gl_FragColor = vec4(diffuse + ambient + TVdiffuse, v_Color.a);\n' +
  '  }\n'+
  '}\n';

function main() {
  // retrieve wegl canvas
  var canvas = document.getElementById('webgl');

  // get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // init shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // set the cube vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);

  // get storage locations for uniform variables
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
  
  // get storage location for flag variables
  var u_UseTVLight = gl.getUniformLocation(gl.program, "u_UseTVLight");
  var u_UseTextures = gl.getUniformLocation(gl.program, "u_UseTextures");
  var u_IsLight = gl.getUniformLocation(gl.program, "u_IsLight");
  if (!u_IsLight || !u_UseTVLight || ! u_UseTextures) { 
    console.log('Failed to get the storage location for boolean flags');
    return;
  }
  
  // set is lgiht to false
  gl.uniform1i(u_IsLight, false);
  
  // create the modelMatrix
  var modelMatrix = new Matrix4();

  // set the u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
  // set the light color to white
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // set the point lighting world coordinates
  gl.uniform3f(u_LightPosition, 3.0, 5.0, 3.0);
  // set the ambient lighting
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  // create the view projection matrix
  var viewProjMatrix = new Matrix4();
  
  // set the virtual camera position
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0,30.0, 60.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  viewProjMatrix.translate(7.5,0.0,0.0);

  // handle on keydown 
  document.onkeydown = function(ev){ keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTVLight, u_UseTextures, u_IsLight); };
  
  // draw the scene 
  drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, u_IsLight);
}

const MOVE_STEP = 3.0; // how much to move the model
const ANGLE_STEP = 7.5; // how much to rotate the model
var g_rotate_angle = 0.0; // current rotation
var chair_move = 0.0; // current chair displacement
var arm_chair_angle = 0.0; // current arm chair rotation
var cabinet_angle = 0.0; // current cabinet drawer rotation
var drawer_move = 0.0; // current cupboard drawer displacement
var use_tv_light = false; // flag for using tv light


function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTVLight, u_UseTextures, u_IsLight) {
  switch (ev.keyCode) {
    case 40: 
	  // move the virtual camera
      viewProjMatrix.lookAt(0.0,0.0, MOVE_STEP, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 38: 
	// move the virtual camera
      viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.0,0.0, MOVE_STEP, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	  viewProjMatrix.lookAt(0.1,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 39: 
	// rotate the model
      g_rotate_angle -= ANGLE_STEP;
      break;
    case 37: 
	// rotate the model
      g_rotate_angle += ANGLE_STEP;
      break;
	case 65:
	// move the chairs
	  if (chair_move < 2.5){
		  chair_move += 0.25;
	  }
	  break;
	case 83:
	// move the chairs
	  if (chair_move > -2.0){
	    chair_move -= 0.25;
	    
	  }
	  break;
	case 90:
	// rotate the arm chair
	  if (arm_chair_angle > -30){
		  arm_chair_angle -= 5.0;
	  }
	  break;
	case 88:
	// rotate the arm chair
	  if (arm_chair_angle < 15){
		  arm_chair_angle += 5.0;
	  }
	  break;
	case 81:
	// open the cabinet drawer
	  if (cabinet_angle < 90) {
		cabinet_angle += 9.0;
	  }
	  break;
	case 87:
	// close the cabinet drawer
	  if (cabinet_angle > 0) {
		cabinet_angle -= 9.0;
	  }
	  break;
	case 79:
	// open the cupboard drawer
	  if (drawer_move < 2.0){
		  drawer_move += 0.5;
	  }
	  break;
	case 80:
	// close the cupboard drawer
	  if (drawer_move > 0.0){
		  drawer_move -= 0.5;
	  }
	  break;
	  
	case 32:
		if (use_tv_light) {
			// toggle TV light off
			gl.uniform1i(u_UseTVLight, false);
			use_tv_light = false;
		} else {
			// use TV light in the fragment shader
			gl.uniform1i(u_UseTVLight, true);
			use_tv_light = true;
		}
		break;
  }
  // draw the scene
  drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, u_IsLight);
}

function initVertexBuffers(gl) {
  // cube coordinates
  var vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
  ]);
 
  // normals
  var normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ]);
  
  // texture coordinates
  var texCoords = new Float32Array([
    1.0, 1.0,    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0,    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0,    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0,    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0   // v4-v7-v6-v5 back
  ]);

  // indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // write the vertex property to buffers
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;

  // unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // write the indices to the buffer object
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
  // create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  
  // write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
  // element size
  var FSIZE = data.BYTES_PER_ELEMENT;

  // assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, FSIZE * num, 0);
  // enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

// local model matrix
var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, u_IsLight) {
  // clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw the objects in the scene
  draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, 7.0,g_rotate_angle+0.0);
  draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, -10.0,g_rotate_angle+275.0);
  draw_rug(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 10.0, 0.0, 10.0,g_rotate_angle+0.0);
  draw_cabinet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -2.0, 0.0, -25.0,g_rotate_angle+215.0);
  // pass u_IsLight to ensure the TV screen is lit up
  draw_tv(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,u_IsLight, 25.0, 3.2, -2.0,g_rotate_angle+305.0);
  draw_arm_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -16.0, 0.0, 0.0,g_rotate_angle+90);
  // pass u_IsLight to ensure the lighting parts of the lamp are specified
  draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, u_IsLight, 16.0, 0.0, 0.0,g_rotate_angle+0.0);
  draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, u_IsLight, 0.0, 0.0, 22.0,g_rotate_angle+0.0);
  draw_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -3.0, 0.0, -15.0,g_rotate_angle+90.0);
  // pass the chair move value to ensure the chairs are displaced the specified amount
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -17.5-chair_move, 0.0, 0.0,g_rotate_angle+0.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -17.5-chair_move, 0.0, -4.0,g_rotate_angle+0.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 8.5-chair_move, 0.0, 2.0,g_rotate_angle+180.0);
  draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 8.5-chair_move, 0.0, -2.0,g_rotate_angle+180.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 2.0, 0.0, -13.0,g_rotate_angle+0.0,0.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 7.0, 0.0, -13.0,g_rotate_angle+0.0,0.0);
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 12.0, 0.0, -13.0,g_rotate_angle+0.0,0.0);
  // pass the drawer move value to ensure the cupboard drawers are displaced the specified amount
  draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 17.0, 0.0, -13.0,g_rotate_angle+0.0,drawer_move);
  draw_pool_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, -19.0, 0.0, 13.0,g_rotate_angle+0.0);
  draw_walls_and_floor(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, 0.0,g_rotate_angle+0.0);
  draw_poster(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, 0.0, 0.0, 0.0,g_rotate_angle+0.0);
}

function draw_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
  // draw table object
  // pass the y_rotate value to ensure the model is rotated w.r.t the virtual camera
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  // pass the x, y, and z displacement to ensure the model is placed in the correct position
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  // draw the box with the given dimensions 1.0 3.0 1.0 and colour 1.0 0.8 0.4 and texture id: texture_wood
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+4.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+8.0, y+0.0, z+4.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+8.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+4.0, y+3.0, z+2.0);
  drawBox(gl, n, 9.0, 0.5, 5.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
}

function draw_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
  // draw chair object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+2.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.0, y+0.0, z+2.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+2.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.5, 2.5, 0.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.0, y+2.5, z+1.0);
  drawBox(gl, n, 2.5, 0.1, 2.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.25, y+2.5, z+1.0);
  g_modelMatrix.rotate(5.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.1, 3.5, 2.5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.8,0.4, "texture_wood");
}

function draw_sofa(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
  // draw sofa object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 4.0, 1.5, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "texture_sofa");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.5, 4.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "texture_sofa");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z-4.0);
  drawBox(gl, n, 4.5, 1.25, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "texture_sofa");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z+4.0);
  drawBox(gl, n, 4.5, 1.25, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,0.4,0.6, "texture_sofa"); 
}

function draw_lamp(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, u_IsLight, x, y, z, y_rotate) {
  // draw lamp object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 2.0, 0.25, 2.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.6,0.6, "texture_metallic");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 10.0, 0.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.6,0.6, "texture_metallic");
  
  // set u_IsLight to true for the light part of the lamp
  gl.uniform1i(u_IsLight, true);	
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+7.5, z+0.0);
  drawBox(gl, n, 1.25, 2.0, 1.25, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,1.0,1.0, "");
  gl.uniform1i(u_IsLight, false);	
}

function draw_tv(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, u_IsLight, x, y, z, y_rotate) {
  // draw the TV object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 2.0, 0.25, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_matte");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 1.5, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_matte");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z+0.0);
  drawBox(gl, n, 0.5, 3.0, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_matte");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.25, y+1.5, z+0.0);
  drawBox(gl, n, 0.5, 4.0, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_matte");
  
  // if TV light is being used display the TV screen
  if (use_tv_light){
	  gl.uniform1i(u_IsLight, true);	
	  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
      g_modelMatrix.translate(x-0.50, y+2.0, z+0.0);
      drawBox(gl, n, 0.1, 3.0, 5.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,1.0,1.0,1.0, "texture_display");
	  gl.uniform1i(u_IsLight, false);
  }
}

function draw_rug(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
  // draw rug object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 8.0, 0.05, 12.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.0,0.0,0.0, "texture_carpet"); 
}

function draw_arm_chair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) {
  // draw arm chair object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 3.5, 2.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "texture_chair");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.75, y+2.0, z+0.0);
  drawBox(gl, n, 1.0, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "texture_chair");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+2.0, z+0.0);
  drawBox(gl, n, 1.0, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "texture_chair");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+2.0, z-1.0);
  g_modelMatrix.rotate(-15.0+arm_chair_angle,1.0,0.0,0.0);
  drawBox(gl, n, 3.5, 4.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.4,1.0, "texture_chair");
}

function draw_cupboard(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate, drawer_translate) { 
  // draw cupboard object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 3.5, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.75, y+0.0, z+0.0);
  drawBox(gl, n, 0.10, 10.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+0.0, z+0.0);
  drawBox(gl, n, 0.10, 10.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z-1.5);
  g_modelMatrix.rotate(90.0, 0.0,1.0,0.0);
  drawBox(gl, n, 0.10, 10.0, 3.4, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+9.0, z+0.0);
  drawBox(gl, n, 3.5, 1.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+7.0, z+0.0);
  drawBox(gl, n, 3.5, 0.10, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+5.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  // pass the drawer_translate value to ensure the drawer is moved a specified amount
  g_modelMatrix.translate(x+0.0, y+1.2, z+0.0+drawer_translate);
  drawBox(gl, n, 3.5, 0.1, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.2, z+1.6+drawer_translate);
  drawBox(gl, n, 3.5, 1.8, 0.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.65, y+1.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.65, y+1.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 3.5, 0.1, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+5.2, z+0.0+drawer_translate);
  drawBox(gl, n, 3.5, 0.1, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+5.2, z+1.6+drawer_translate);
  drawBox(gl, n, 3.5, 1.8, 0.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.65, y+5.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-1.65, y+5.2, z+0.0+drawer_translate);
  drawBox(gl, n, 0.1, 1.0, 3.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.4,0.2,0.0, "texture_dark");  
}

function draw_cabinet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) { 
  // draw cabinet object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "texture_brown");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+1.5, z-1.5);
  g_modelMatrix.rotate(90.0, 1.0,0.0,0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "texture_brown");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+3.0, z+0.0);
  drawBox(gl, n, 7.0, 0.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "texture_brown");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-3.5, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "texture_brown");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+3.5, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "texture_brown");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 0.25, 3.25, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "texture_brown");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+1.75, y+0.0, z+1.50);
  // pass the cabinet angle value to ensure the cabinet drawer is rotated the specified amount
  g_modelMatrix.rotate(cabinet_angle, 1.0, 0.0, 0.0);
  drawBox(gl, n, 3.25, 3.25, 0.15, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.6,0.4,0.2, "texture_brown");
}

function draw_pool_table(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate) { 
  // draw pool table object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+0.0, y+0.0, z+5.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.0, y+0.0, z+0.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.0, y+0.0, z+5.0);
  drawBox(gl, n, 1.0, 3.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z+2.5);
  drawBox(gl, n, 12.0, 1.0, 7.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.0,0.6,0.0, "texture_velvet");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z-1.0);
  g_modelMatrix.rotate(-15.0,1.0,0.0,0.0);
  drawBox(gl, n, 12.0, 2.0, 0.75, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+5.0, y+3.0, z+6.0);
  g_modelMatrix.rotate(15.0,1.0,0.0,0.0);
  drawBox(gl, n, 12.0, 2.0, 0.75, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-0.75, y+3.0, z+2.5);
  g_modelMatrix.rotate(15.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.75, 2.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x+10.75, y+3.0, z+2.5);
  g_modelMatrix.rotate(-15.0,0.0,0.0,1.0);
  drawBox(gl, n, 0.75, 2.0, 8.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.2,0.2,0.2, "texture_black");
}

function draw_walls_and_floor(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate){
  // draw walls and floor
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.5, y+0.0, z+5.0);
  drawBox(gl, n, 50.0, 0.0, 45.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.76,0.76,0.64, "texture_floor");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-2.5, y+0.0, z-17.5);
  drawBox(gl, n, 50.0, 12.0, 0.1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.95,0.95,0.95, "texture_wall");
  
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-27.5, y+0.0, z+5.0);
  drawBox(gl, n, 0.1, 12.0, 45.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.95,0.95,0.95, "texture_wall");
}

function draw_poster(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, x, y, z, y_rotate){
  // draw poster object
  g_modelMatrix.setRotate(y_rotate, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x-12.5, y+2.0, z-17.4);
  drawBox(gl, n, 5.0, 8.0, 0.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures,0.76,0.76,0.64, "texture_poster");
}

var g_matrixStack = []; // array for storing matrix stack
function pushMatrix(m) { // push the specified matrix to the stack
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // retreive the top matrix from the stack
  return g_matrixStack.pop();
}

var g_normalMatrix = new Matrix4();  // local model matrix for normals

// draw box
function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_UseTextures, r, g, b, texture_id) {
  pushMatrix(g_modelMatrix);   // push the model matrix
  // create a vertex colour matrix
    var colors = new Float32Array([
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v1-v2-v3 front
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v0-v3-v4-v5 right
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v0-v5-v6-v1 up
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v1-v6-v7-v2 left
    r, g, b,   r, g, b,   r, g, b,  r, g, b,      // v7-v4-v3-v2 down
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v4-v7-v6-v5 back
 ]);
 
    if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;
    // scale the cube and draw
    g_modelMatrix.scale(width, height, depth);
    // calculate the model view project matrix and pass it to u_MvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    // calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // draw
	if (texture_id != ""){
		// if texture_id is given
		var Cubetexture = gl.createTexture();   // create a texture object
		if (!Cubetexture) {
		  console.log('Failed to create the texture object');
		  return false;
		}

	  // get the storage location of u_Sampler
		var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
		if (!u_Sampler) {
		  console.log('Failed to get the storage location of u_Sampler');
		  return false;
		}
		// set u_UseTextures to true
		gl.uniform1i(u_UseTextures, true);			
		// draw with textures
		loadTexAndDraw(gl, n, Cubetexture, u_Sampler, texture_id);
	} else {
		// otherwise draw with colour
		// set u_UseTextures to false
		gl.uniform1i(u_UseTextures, false);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	}
	
	g_modelMatrix = popMatrix();   // retrieve the model matrix
}

function loadTexAndDraw(gl, n, texture, u_Sampler, texture_id) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, document.getElementById(texture_id));
  // set the texturing parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // assign u_Sampler to TEXTURE0
  gl.uniform1i(u_Sampler, 0);

  // draw the textured cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
