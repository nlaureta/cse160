// ColoredPoint.js (c) 2012 matsuda

//--------------Credits----------------------------
//Professor's videos: https://youtube.com/playlist?list=PLbyTU_tFIkcNbxNKJWEcjfBp97fKE2UuW
// For spot light: https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-spot.html
// James Kohl Hall of Fame for mouse rotation controls

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    //v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;  
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0; 
  uniform sampler2D u_Sampler1; 
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  uniform bool u_spotLightOn;
  uniform vec4 u_lightColor;
  uniform vec3 u_lightDirection;
void main() {
  if (u_whichTexture == -3) {
    gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
  } else if (u_whichTexture == -2) {                    // use color
    gl_FragColor = u_FragColor;
  } else if (u_whichTexture == -1) {            // use UV debug color
    gl_FragColor = vec4(v_UV, 1.0, 1.0);
  } else if (u_whichTexture == 0) {             // use texture0
    gl_FragColor = texture2D(u_Sampler0, v_UV);
  } else if (u_whichTexture == 1) {
    gl_FragColor = texture2D(u_Sampler1, v_UV);
  } else if (u_whichTexture == 2) {
    gl_FragColor = texture2D(u_Sampler2, v_UV);
  } else if (u_whichTexture == 3) {
    gl_FragColor = texture2D(u_Sampler3, v_UV);
  } else {                                      // Error, put Redish color
    gl_FragColor = vec4(1, 0.2, 0.2, 0);
  }

  if (u_spotLightOn) {
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    //N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    //Reflection
    vec3 R = reflect(-L, N);

    //Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    //Specular
    float specular = 0.0;

    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    vec3 ambient = vec3(gl_FragColor) * 0.15;
    float spotlight_limit = .96;
    float u_shininess = 15.0;
    float dotDirection = dot(normalize(lightVector), -normalize(u_lightDirection));
    float dirSubLim = dotDirection - spotlight_limit;
    if (dotDirection >= (spotlight_limit - .1)) {
      if (dotDirection >= spotlight_limit) {
        diffuse = vec3(gl_FragColor) * nDotL;
        if (nDotL > 0.0) {
          specular = pow(max(dot(E, R), 0.0), u_shininess);
        }
      } 
      else {
        diffuse = vec3(gl_FragColor) * nDotL * ((dirSubLim + 0.1) / 0.1);
        if (nDotL > 0.0) {
          specular = pow(max(dot(E, R), 0.0), u_shininess) * ((dirSubLim + 0.1) / 0.1);
        }
      }
    }

    vec4 SD = vec4(specular + diffuse, 1);
    SD *= u_lightColor;

    if (u_lightOn) {
      //if(u_whichTexture != 3) {
      gl_FragColor = vec4(vec3(SD) + ambient, 1.0);
      //}else {
      //gl_FragColor = vec4(diffuse + ambient,1.0);
      //}
    }

  }else {
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // if(r<1.0){
    //   gl_FragColor = vec4(1,0,0,1);
    // }else if(r<2.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }

    //Light falloff visualization
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    //N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    //Reflection
    vec3 R = reflect(-L, N);

    //Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    //Specular
    float specular = pow(max(dot(E, R), 0.0), 64.0) * .8;
    vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;

    vec4 SD = vec4(specular + diffuse, 1);
    SD *= u_lightColor;

    if (u_lightOn) {
      //if(u_whichTexture != 3) {
      gl_FragColor = vec4(vec3(SD) + ambient, 1.0);
      //}else {
      //gl_FragColor = vec4(diffuse + ambient,1.0);
      //}
    }
  }
}`;

//Overall global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let a_PointSize;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
let u_lightPos;
let u_cameraPos
let u_lightOn;
let u_NormalMatrix;
let u_spotlightPos;
let u_lightColor;
let u_lightDirection;
let u_spotLightOn;

let g_globalAngle = 300;
let g_globalAngleX = 0;
let g_globalAngleY = 1;
let g_globalAngleZ = 0;
let g_leftArmAngle = -90;
let g_rightArmAngle = -180;
let g_leftFeetAngle = 0;
let g_rightFeetAngle = 0;
let g_beakTranslate = 15.90;
let g_leftHandAngle = 0;
let g_rightHandAngle = 0;
let time;
var coordsOne = [2, 2];
let g_globalAnglePos = 1;

//controls
let forward = false;
let back = false;
let left = false;
let right = false;
let clickDown = false;
let panLeft = false;
let panRight = false;
let spacebar = false;

//fps
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

let mouseRot = new Vector3();
let g_ShapesList = [];
var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];


var g_moveCamera = new Camera();
g_moveCamera.eye = new Vector3([0, 0, 3]);
function keydown(ev) {
  if (ev.keyCode == 87) { forward = true; }      // w
  if (ev.keyCode == 83) { back = true; }      // s
  if (ev.keyCode == 65) { left = true; }      // a
  if (ev.keyCode == 68) { right = true; }      // d
  if (ev.keyCode == 81) { panLeft = true; }       //q
  if (ev.keyCode == 69) { panRight = true; }       //e
  if (ev.keyCode == 32) { spacebar = true; }      //space
  //console.log(ev.keyCode);
}
function keyup(ev) {
  if (ev.keyCode == 87) { forward = false; }      // w
  if (ev.keyCode == 83) { back = false; }      // s
  if (ev.keyCode == 65) { left = false; }      // a
  if (ev.keyCode == 68) { right = false; }      // d
  if (ev.keyCode == 81) { panLeft = false; }       //q
  if (ev.keyCode == 69) { panRight = false; }       //e
  if (ev.keyCode == 32) { spacebar = false; }       //space
  //console.log(ev.keyCode);
}

//helper function for tick to move cam
function moveCam() {
  if (forward) {
    g_moveCamera.moveForward(.03);
  }
  if (back) {
    g_moveCamera.moveBackwards(.03);
  }
  if (left) {
    g_moveCamera.moveLeft(.03);
  }
  if (right) {
    g_moveCamera.moveRight(.03);
  }
  if (panLeft) {
    g_moveCamera.panLeft(.03);
  }
  if (panRight) {
    g_moveCamera.panRight(.03);
  }
}

//Called by browser repeatedly
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // let delta = t - g_seconds;
  // g_seconds = t;
  updateAnimationAngles();
  moveCam();
  //Draw everything
  renderAllShapes();
  //Tell browser to update again when it has time
  requestAnimationFrame(tick);

}

function updateAnimationAngles() {
  if (g_animOn) {
    g_lightPos[0] = Math.cos(g_seconds) * 3.9; // x
    //g_lightPos[1]=Math.sin(g_seconds); // y
    g_lightPos[2] = Math.sin(g_seconds) * 3.9; // z
  }
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); // better performance
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) { console.log('Failed to intialize shaders.'); return; }
  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) { console.log('Failed to get the storage location of a_Position'); return; }

  //Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) { console.log('Failed to get the storage location of a_UV'); return; }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) { console.log('Failed to get the storage location of a_UV'); return; }

  // u_NormalMatrix  = gl.getAttribLocation(gl.program, 'u_NormalMatrix');
  // if (u_NormalMatrix < 0) { console.log('Failed to get the storage location of u_NormalMatrix'); return; }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) { console.log('Failed to get the storage location of u_FragColor'); return; }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) { console.log('Failed to get the storage location of u_lightPos'); return; }
  
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) { console.log('Failed to get the storage location of u_lightOn'); return; }

  u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');
  if (!u_spotLightOn) { console.log('Failed to get the storage location of u_spotLightOn'); return; }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) { console.log('Failed to get the storage location of u_cameraPos'); return; }

  //Get the storange location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { console.log('Failed to get the storage location of u_ModelMatrix'); return; }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) { console.log('Failed to get the storage location of u_GlobalRotateMatrix'); return; }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { console.log('Failed to get the storage location of u_ViewMatrix'); return; }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) { console.log('Failed to get the storage location of u_ProjectionMatrix'); return; }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get teh storage location of u_lightColor');
    return;
  }

  u_lightDirection = gl.getUniformLocation(gl.program, 'u_lightDirection');
  if (!u_lightDirection) {
    console.log('Failed to get teh storage location of u_lightDirection');
    return;
  }

  //Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) { console.log('Failed to get the storage location of u_Sampler0'); return; }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) { console.log('Failed to get the storage location of u_Sampler1'); return; }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) { console.log('Failed to get the storage location of u_Sampler2'); return; }
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) { console.log('Failed to get the storage location of u_Sampler3'); return; }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) { console.log('Failed to get the storage location of u_whichTexture'); return; }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_normalOn = false;
let g_lightOn = true;
let g_spotlightOn = false;
let g_animOn = true;
let g_lightPos = [0,3,-2];

function handleClicks() {
  //animation buttons
  //document.getElementById('penguinAnimationOn').onclick = function () { g_moveCamera.eye = new Vector3([-30, -25, 85]); document.getElementById("playSong").play(); };
  document.getElementById('NormalOn').onclick = function () {g_normalOn= true;};
  document.getElementById('NormalOff').onclick = function () {g_normalOn= false;};

  document.getElementById('lightOff').onclick = function () {g_lightOn= false;};
  document.getElementById('lightOn').onclick = function () {g_lightOn= true;};

  document.getElementById('spotOff').onclick = function () {g_spotlightOn= false;};
  document.getElementById('spotOn').onclick = function () {g_spotlightOn= true;};

  document.getElementById('animOff').onclick = function () {g_animOn= false;};
  document.getElementById('animOn').onclick = function () {g_animOn= true;};

  document.getElementById('ResetColor').onclick = function () {document.getElementById("Rslide").value = 100; document.getElementById("Gslide").value = 100; document.getElementById("Bslide").value = 100; g_lightColor = [1,1,1]};
  document.getElementById('ResetPos').onclick = function () {document.getElementById("lightSlideX").value = 0; document.getElementById("lightSlideY").value = 250; document.getElementById("lightSlideZ").value = 0; g_lightPos = [0,4,0]};


  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});

  document.getElementById('Rslide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightColor[0] = this.value/100; renderAllShapes();}});
  document.getElementById('Gslide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightColor[1] = this.value/100; renderAllShapes();}});
  document.getElementById('Bslide').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightColor[2] = this.value/100; renderAllShapes();}});
  //document.getElementById('penguinAnimationOff').onclick = function () { g_penguinAnimation = false; g_beakTranslate = 15.90; };
  //document.getElementById('penguinAnimationReset').onclick = function () { resetAnimation(); document.getElementById("leftArmSlide").value = -90; document.getElementById("rightArmSlide").value = -180; document.getElementById("leftFeetSlide").value = 0; document.getElementById("rightFeetSlide").value = 0; document.getElementById("beakSlide").value = 15.90; document.getElementById("leftHandSlider").value = 0; document.getElementById("rightHandSlider").value=0; };

  //camera settings
  // document.getElementById('cameraReset').onclick = function () { resetCamera(); document.getElementById("angleXSlide").value = 0; document.getElementById("angleYSlide").value = 1; document.getElementById("angleZSlide").value = 0; };
  // document.getElementById("angleXSlide").addEventListener('mousemove', function () { g_globalAngleX = this.value; renderAllShapes(); });
  // document.getElementById("angleYSlide").addEventListener('mousemove', function () { g_globalAngleY = this.value; renderAllShapes(); });
  // document.getElementById("angleZSlide").addEventListener('mousemove', function () { g_globalAngleZ = this.value; renderAllShapes(); });

  //penguin sliders
  // document.getElementById("leftArmSlide").addEventListener('mousemove', function () { g_leftArmAngle = this.value; renderAllShapes(); });
  // document.getElementById("rightArmSlide").addEventListener('mousemove', function () { g_rightArmAngle = this.value; renderAllShapes(); });
  // document.getElementById("leftFeetSlide").addEventListener('mousemove', function () { g_leftFeetAngle = this.value; renderAllShapes(); });
  // document.getElementById("rightFeetSlide").addEventListener('mousemove', function () { g_rightFeetAngle = this.value; renderAllShapes(); });
  // document.getElementById("beakSlide").addEventListener('mousemove', function () { if (!g_penguinAnimation) { g_beakTranslate = this.value; renderAllShapes(); } });
  // document.getElementById("leftHandSlider").addEventListener('mousemove', function () { g_leftHandAngle = this.value; renderAllShapes(); });
  // document.getElementById("rightHandSlider").addEventListener('mousemove', function () { g_rightHandAngle = this.value; renderAllShapes(); });

  canvas.onmousedown = (e) => {
    if (e.button == 0) {
      let x = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
      let y = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

      mouseRot.elements.set([x, y, 0]);
      clickDown = true;
    }
  };

  canvas.onmouseup = (e) => {
    if (e.button == 0) {
      clickDown = false;
    }
  };

  canvas.onmousemove = (e) => {
    if (clickDown) {
      let dx = ((e.clientX / e.target.clientWidth) * 2.0 - 1.0) - mouseRot.elements[0];
      let dy = ((-e.clientY / e.target.clientHeight)) * 2.0 + 1.0 - mouseRot.elements[1];

      mouseRot.elements[0] = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
      mouseRot.elements[1] = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

      var rMat = new Matrix4();
      rMat.rotate(dy * 100, 1, 0, 0);
      rMat.rotate(-dx * 100, 0, 1, 0);
      rMat.rotate(0, 0, 0, 1);
      var at = new Vector3(g_moveCamera.at.elements).sub(g_moveCamera.eye);
      at.normalize();
      at = rMat.multiplyVector3(at);
      at.add(g_moveCamera.eye);
      g_moveCamera.at = at;
    }
  };
}

function initTextures() {
  //Create new image object
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image onject');
    return false;
  }
  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image2 onject');
    return false;
  }
  var image3 = new Image();
  if (!image3) {
    console.log('Failed to create the image onject');
    return false;
  }
  var image4 = new Image();
  if (!image4) {
    console.log('Failed to create the image onject');
    return false;
  }
  //Register the event handler to be called on loading image
  image.onload = function () { sendImageToTEXTURE0(image, u_Sampler0, 0); };
  //Tell the brower to load an image
  image.src = 'images/redSky2.jpg';

  image2.onload = function () { sendImageToTEXTURE0(image2, u_Sampler1, 1); };
  //Tell the brower to load an image
  image2.src = 'resources/iceblock.png'

  image3.onload = function () { sendImageToTEXTURE0(image3, u_Sampler2, 2); };
  //Tell the brower to load an image
  image3.src = 'resources/lavablock.png'

  image4.onload = function () { sendImageToTEXTURE0(image4, u_Sampler3, 3); };
  //Tell the brower to load an image
  image4.src = 'images/blueSky.jpg'

  return true;
}

function sendImageToTEXTURE0(image, u_Sampler, textType) {
  var texture = gl.createTexture(); // Creates texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }
  let gl_texture = gl.TEXTURE0;
  if (textType == 0) {
    gl_texture = gl.TEXTURE0;
  } else if (textType == 1) {
    gl_texture = gl.TEXTURE1;
  }
  else if (textType == 2) {
    gl_texture = gl.TEXTURE2;
  }
  else if (textType == 3) {
    gl_texture = gl.TEXTURE3;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl_texture);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, textType);

  console.log('finished loadTexture');
}

function drawMap() {
  let w = new Cube();
  for (let z = 0; z < walls.length; z++) {
    for (let x = 0; x < walls[z].length; x++) {
      for (let y = 0; y < walls[z][x].length; y++) {
        if (walls[z][x][y] == 1) {
          w.color = [1.0, 0.0, 0.0, 1.0];
          w.textureNum = 1;
          if(g_normalOn) {w.textureNum = -3};
          w.matrix.setTranslate(-5, -4.6, -5.2);
          w.matrix.scale(.2, .2,.2);
          w.matrix.translate(x, y, z);
          w.renderfaster();
        }
      }
    }
  }
  //}
}
// var g_map1 = [
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 1, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],

// ];
function lavaFloor() {
  var body = new Cube();
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      // if(x == 0 || x==31||y==0 || y==31) {
      body.color = [1.0, 0.0, 0.0, 1.0];
      body.textureNum = 1;
      if(g_normalOn) {body.textureNum = -3};
      body.matrix.setTranslate(10, -40, 10);
      body.matrix.scale(3.2, .5, 3.2);
      body.matrix.translate(x - 16, -.75, y - 16);
      body.renderfaster();
      //}
    }
  }
}

let g_lightColor=[1,1,1,1];
let g_lightDirection = [0,-1,0];

function renderAllShapes() { //render scene
  var startTime = performance.now();

  //Pass projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(g_moveCamera.fov, canvas.width / canvas.height, .1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  //Pass view matrix
  var viewMat = new Matrix4();
  //viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0); // eye, at, up
  viewMat.setLookAt(g_moveCamera.eye.elements[0], g_moveCamera.eye.elements[1], g_moveCamera.eye.elements[2],   // (eye, at, up)
    g_moveCamera.at.elements[0], g_moveCamera.at.elements[1], g_moveCamera.at.elements[2],
    g_moveCamera.up.elements[0], g_moveCamera.up.elements[1], g_moveCamera.up.elements[2]); // eye, at, up
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  //var globalRotMat = new Matrix4().rotate(g_globalAngleX,g_globalAngleY,g_globalAngleZ,0); //0,1,0
  let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);
  globalRotMat.rotate(g_globalAnglePos, 0, 0, 1);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawMap();
  //lavaFloor();

  // let w = new Cube();
  // for (let z = 0; z < walls.length; z++) {
  //   for (let x = 0; x < walls[z].length; x++) {
  //     for (let y = 0; y < walls[z][x].length; y++) {
  //       if (walls[z][x][y] == 1) {
  //         w.matrix.rotate(200,0,1,0);
  //         w.matrix.setTranslate(40,-20,40);
  //         w.matrix.translate(x, y, z);
          
  //         w.textureNum = 2;
  //         w.renderfaster();
  //       }
  //     }
  //   }
  // } 

  // var body = new Cube();
  // for (let x = 0; x < 32; x++) {
  //   for (let y = 0; y < 32; y++) {
  //     // if(x == 0 || x==31||y==0 || y==31) {
  //       body.color = [1.0, 0.0, 0.0, 1.0];
  //       body.textureNum = 1;
  //       body.matrix.setTranslate(-23, -36.7, 60);
  //       body.matrix.scale(1, 1.5, 2);
  //       body.matrix.translate(x - 16, -.75, y - 16);
  //       body.renderfaster();
  //     //}
  //   }
  // }
  
  //Pass the light position to GLSL
  gl.uniform3f(u_lightPos,g_lightPos[0],g_lightPos[1], g_lightPos[2]);
  //Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, g_moveCamera.eye.elements[0], g_moveCamera.eye.elements[1], g_moveCamera.eye.elements[2]);
  //Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);

  gl.uniform1i(u_spotLightOn, g_spotlightOn);

  gl.uniform4f(u_lightColor, g_lightColor[0], g_lightColor[1],g_lightColor[2], g_lightColor[3]);

  gl.uniform3f(u_lightDirection, g_lightDirection[0], g_lightDirection[1], g_lightDirection[2]);
  
  //Draw the light
  var light = new Cube();
  light.color = g_lightColor;
  light.matrix.translate (g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.renderfaster();

  //Draw sky
  var sky = new Cube();
  sky.color = [.8, .8, .8, 1.0];
  sky.textureNum = 3;
  if(g_normalOn) {sky.textureNum = -3};
  sky.matrix.scale(-10, -10, -10);
  sky.matrix.translate(-.5, -.5, -.5);
  sky.renderfaster();

  var sphere = new Sphere();
  //sphere.textureNum = 3;
  sphere.color = [1.0, 0.0, 0.0, 1.0];
  if(g_normalOn) {sphere.textureNum = -3};
 // sphere.matrix.setScale(1, 1, 1);
  sphere.matrix.translate(-1, -3.5, 2.5);
  sphere.render();

  var sphere2 = new Sphere();
  sphere2.textureNum = -1;
  sphere2.color = [1.0, 0.0, 0.0, 1.0];
  if(g_normalOn) {sphere2.textureNum = -3};
 // sphere.matrix.setScale(1, 1, 1);
  sphere2.matrix.translate(3, .5, -2.5);
  sphere2.render();

  var sphere3 = new Sphere();
  sphere3.textureNum = 1;
  sphere3.color = [1.0, 0.0, 0.0, 1.0];
  if(g_normalOn) {sphere3.textureNum = -3};
 // sphere.matrix.setScale(1, 1, 1);
  sphere3.matrix.translate(-2, -1.5, -2.5);
  sphere3.render();

  var sphere4 = new Sphere();
  sphere4.textureNum = 2;
  sphere4.color = [1.0, 0.0, 0.0, 1.0];
  if(g_normalOn) {sphere4.textureNum = -3};
 // sphere.matrix.setScale(1, 1, 1);
  sphere4.matrix.translate(1, -4.5, -2.5);
  sphere4.render();

  var floor = new Cube(); // do later
  //floor.textureNum = 1;
  floor.color = [0.0,0.5,1,1];
  floor.matrix.translate(0,-4.49,0.0);
  floor.matrix.scale(10,0,10);
  floor.matrix.translate(-.5,0,-.5);
  floor.renderfaster();

  //var sphere = new Sphere();
 // sphere.render();

  //Draw floor
  // var floor = new Cube();
  // floor.color = [1.0,0.0,0.0,1.0];
  // floor.textureNum = 2;
  // floor.matrix.translate(0,-98,0.0);
  // floor.matrix.scale(100,0,100);
  // floor.matrix.translate(-.5,0,-.5);
  // floor.renderfaster();

  //let penguin = new Penguin();
  //penguin.matrix.scale(5,5,5);
  //penguin.matrix.translate(0,2,0);
  //penguin.updateAnimationAngles(g_seconds);
  //if(g_normalOn) {penguin.textureNum = -3};
  //penguin.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "theFPS");
}

function main() {
  // Retrieve <canvas> element
  setupWebGL();
  // Initialize shaders
  connectVariablesToGLSL();
  // Initilizes clicks 
  handleClicks();

  initTextures();

  document.onkeydown = keydown;
  document.onkeyup = keyup;

  walls = [];
  for (let z = 0; z < 32; z++) {
    walls.push([]);
    for (let x = 0; x < 32; x++) {
      walls[z].push([]);
      for (let y = 0; y < 32; y++) {
        walls[z][x].push(0);
        if ((z < (30 - Math.abs(x)) * 59 / 30) && (z < (30 - Math.abs(y)) * 59 / 30) && (z < (30 - Math.abs(x + y) / Math.sqrt(2)) * 59 / 30) && (z < (30 - Math.abs(x - y) / Math.sqrt(2)) * 59 / 30) && (z > 0)) {
          walls[z][x][y] = 1;
        }
      }
    }
  }

  //g_moveCamera.eye = new Vector3([-4, -3, -4])
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.6, .8, 1.0);
  //plays animations
  requestAnimationFrame(tick);

}

//Shift click action 
// function shiftClick(event) {
//   if (event.shiftKey) {
//     g_leftArmAngle = -90;
//     g_rightArmAngle = -180;
//     g_leftFeetAngle = 0;
//     g_rightFeetAngle = 0;
//     g_beakTranslate = 15.90;
//     g_leftArmAnimation = true;
//   } else {
//     g_leftArmAnimation = false;
//     g_leftArmAngle = -90;
//   }
//   time = setTimeout(function playAnim() {
//     g_leftArmAnimation = false;
//     g_leftArmAngle = -90;
//     clearTimeout(time);
//     //console.log("stopped");
//   }, 2000);
// }

//Helper function for click(ev)
function convertCoordinatesEvenToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}


//Displays FPS
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}