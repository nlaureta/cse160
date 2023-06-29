// ColoredPoint.js (c) 2012 matsuda

//--------------Credits----------------------------
//Professor's videos: https://www.youtube.com/watch?v=EBO9gk2feVY&list=PLbyTU_tFIkcOs7XVopOy5Oti-HGiIZx0J
//(WebGL) Matsuda/Lea Ch10 for OBJ files
// James Kohl Hall of Fame for mouse rotation controls

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  //uniform float a_PointSize; 
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    //gl_PointSize = a_PointSize;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;  
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0; 
  uniform sampler2D u_Sampler1; 
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){                    // use color
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {            // use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {             // use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }else if(u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }else if(u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else {                                      // Error, push Redish color
      gl_FragColor = vec4(1,0.2,0.2,0);
    }

  }`;

//Overall global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let a_PointSize;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

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

var walls = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

//var map = [[ 1,0, 0, 1], [1, 1, 0 ,1], [ 1, 0, 0, 1] ,[ 1, 1 ,1 ,1 ,]]

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

  console.log(ev.keyCode);
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
    g_moveCamera.moveForward(.5);
  }
  if (back) {
    g_moveCamera.moveBackwards(.5);
  }
  if (left) {
    g_moveCamera.moveLeft(.5);
  }
  if (right) {
    g_moveCamera.moveRight(.5);
  }
  if (panLeft) {
    g_moveCamera.panLeft(.5);
  }
  if (panRight) {
    g_moveCamera.panRight(.5);
  }
}

//Called by browser repeatedly
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // let delta = t - g_seconds;
  // g_seconds = t;
  //updateAnimationAngles();
  moveCam();
  //Draw everything
  renderAllShapes();
  //Tell browser to update again when it has time
  requestAnimationFrame(tick);

}

// let g_leftArmAnimation = false;
// let g_leftFootAnimation = false;
// let g_rightFootAnimation = false;
// let g_penguinAnimation = false;
// function updateAnimationAngles() {
//   if (g_leftArmAnimation) {
//     g_leftArmAngle = (-25 * Math.sin(4.50 * g_seconds));
//   }
//   if (g_penguinAnimation) {
//     g_rightArmAngle = (25 * Math.sin(5.50 * g_seconds)) - 250;

//     g_leftArmAngle = (-25 * Math.sin(5.50 * g_seconds + 3)) - 20;

//     g_rightFeetAngle = (20 * Math.sin(5.50 * g_seconds + 3)) + 20;

//     g_leftFeetAngle = (20 * Math.sin(5.50 * g_seconds)) + 20;

//     if (g_rightFeetAngle >= 39) {
//       g_beakTranslate -= .04;
//     }

//     if (g_rightFeetAngle <= 1) {
//       g_beakTranslate += .04;
//     }
//   }
// }

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
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) { console.log('Failed to get the storage location of u_FragColor'); return; }
  //Get the storange location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { console.log('Failed to get the storage location of u_ModelMatrix'); return; }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) { console.log('Failed to get the storage location of u_GlobalRotateMatrix'); return; }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { console.log('Failed to get the storage location of u_ViewMatrix'); return; }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) { console.log('Failed to get the storage location of u_ProjectionMatrix'); return; }
  //Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) { console.log('Failed to get the storage location of u_Sampler0'); return; }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) { console.log('Failed to get the storage location of u_Sampler0'); return; }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) { console.log('Failed to get the storage location of u_Sampler0'); return; }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) { console.log('Failed to get the storage location of u_whichTexture'); return; }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function handleClicks() {
  //animation buttons
  document.getElementById('penguinAnimationOn').onclick = function () { g_moveCamera.eye = new Vector3([-30, -25, 85]); document.getElementById("playSong").play(); };
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

  // canvas.onmouseup = (e) => {
  //   if (e.button == 0) { 
  //     dragging = false;
  //   }
  //   if (e.button == 2) { 
  //     let eye = g_moveCamera.eye.elements;
  //     let x = eye[0]/10.5;
  //     let y = eye[1]/2.5;
  //     let z = eye[2]/10.5;
  //     x += 12;
  //     x = Math.round(x);
  //     y += 25;
  //     y = Math.round(y);
  //     z += 12;
  //     z = Math.round(z);
  //     console.log(x + " " + y + " " + z);
  //     if (walls[z][x][y] === 0) {
  //       console.log("added")
  //       walls[z][x][y] = 1;
  //     } else {
  //       walls[z][x][y] = 0;
  //       console.log("removed")
  //     }
  //   }
  // };
  canvas.onmouseup = (e) => {
    if (e.button == 0) {
      clickDown = false;
    }
    if (e.button == 2) {
      let x = g_moveCamera.eye.elements[0] / 4.5;
      let y = g_moveCamera.eye.elements[1] / 2;
      let z = g_moveCamera.eye.elements[2] / 5.5;
      x = Math.round(x + 12);
      y = Math.round(y + 25);
      z = Math.round(z + 12);
      if (walls[z][x][y] == 0) {
        console.log("added")
        walls[z][x][y] = 1;
      } else {
        walls[z][x][y] = 0;
        console.log("removed")
      }
      console.log(x + " " + y + " " + z);
    }
  };

  canvas.onmousemove = (e) => {
    if (clickDown) {
      let dx = ((e.clientX / e.target.clientWidth) * 2.0 - 1.0) - mouseRot.elements[0];
      let dy = ((-e.clientY / e.target.clientHeight)) * 2.0 + 1.0 - mouseRot.elements[1];

      mouseRot.elements[0] = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
      mouseRot.elements[1] = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

      var rotMat = new Matrix4();
      rotMat.rotate(dy * 100, 1, 0, 0);
      rotMat.rotate(-dx * 100, 0, 1, 0);
      rotMat.rotate(0, 0, 0, 1);
      var at = new Vector3(g_moveCamera.at.elements).sub(g_moveCamera.eye);
      at.normalize();
      at = rotMat.multiplyVector3(at);
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
          w.matrix.setTranslate(-29, -40, -20);
          w.matrix.scale(1.5, 1.5, 1.5);
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
      body.textureNum = 2;
      body.matrix.setTranslate(20, -38.5, 31);
      body.matrix.scale(3.2, .5, 3.2);
      body.matrix.translate(x - 16, -.75, y - 16);
      body.renderfaster();
      //}
    }
  }
}

function renderAllShapes() { //render scene
  var startTime = performance.now();

  //Pass projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(g_moveCamera.fov, canvas.width / canvas.height, .1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  //Pass view matrix
  var viewMat = new Matrix4();
  //viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0); // eye, at, up
  // viewMat.setLookAt(g_moveCamera.eye.elements[0], g_moveCamera.eye.elements[1], g_moveCamera.eye.elements[2],   // (eye, at, up)
  //   g_moveCamera.at.elements[0], g_moveCamera.at.elements[1], g_moveCamera.at.elements[2],
  //   g_moveCamera.up.elements[0], g_moveCamera.up.elements[1], g_moveCamera.up.elements[2]); // eye, at, up
  console.log(viewMat.setLookAt(0,0,2,0,0,0,0,1,0));
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
  lavaFloor();

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

  var body = new Cube();
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      // if(x == 0 || x==31||y==0 || y==31) {
        body.color = [1.0, 0.0, 0.0, 1.0];
        body.textureNum = 1;
        body.matrix.setTranslate(-23, -36.7, 60);
        body.matrix.scale(1, 1.5, 2);
        body.matrix.translate(x - 16, -.75, y - 16);
        body.renderfaster();
      //}
    }
  }
  

  //Draw sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(100, 100, 100);
  sky.matrix.translate(.2, .1, .3);
  sky.renderfaster();

  //Draw floor
  // var floor = new Cube();
  // floor.color = [1.0,0.0,0.0,1.0];
  // floor.textureNum = 2;
  // floor.matrix.translate(0,-98,0.0);
  // floor.matrix.scale(100,0,100);
  // floor.matrix.translate(-.5,0,-.5);
  // floor.renderfaster();

  let penguin = new Penguin();
  //penguin.matrix.scale(5,5,5);
  //penguin.matrix.translate(0,2,0);
  penguin.updateAnimationAngles(g_seconds);
  penguin.render();

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

  g_moveCamera.eye = new Vector3([-4, -3, -4])
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.6, .8, 1.0);
  //plays animations
  requestAnimationFrame(tick);

}

//Shift click action 
function shiftClick(event) {
  if (event.shiftKey) {
    g_leftArmAngle = -90;
    g_rightArmAngle = -180;
    g_leftFeetAngle = 0;
    g_rightFeetAngle = 0;
    g_beakTranslate = 15.90;
    g_leftArmAnimation = true;
  } else {
    g_leftArmAnimation = false;
    g_leftArmAngle = -90;
  }
  time = setTimeout(function playAnim() {
    g_leftArmAnimation = false;
    g_leftArmAngle = -90;
    clearTimeout(time);
    //console.log("stopped");
  }, 2000);
}

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