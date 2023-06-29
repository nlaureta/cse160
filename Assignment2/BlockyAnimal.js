// ColoredPoint.js (c) 2012 matsuda

//--------------Credits----------------------------
//Professor's videos: https://www.youtube.com/watch?v=8xgejUPmGgo&list=PLbyTU_tFIkcPmW6JknG_z9jdWDpJt7DYS
//(WebGL) Matsuda/Lea Ch3 (91-113) and Ch 4 (Appendix C)
// James Kohl Hall of Fame for mouse rotation contorl

// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
   uniform float a_PointSize; 
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   void main() {
     gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
     gl_PointSize = a_PointSize;
   }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;  // uniform変数
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Overall global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let a_PointSize;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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
var coordsOne = [2,2];
let g_globalAnglePos = 0;
function main() {
  // Retrieve <canvas> element
  setupWebGL();
  // Initialize shaders
  connectVariablesToGLSL();

  // Initilizes clicks 
  handleClicks();

  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) { 
    if (ev.buttons == 1) { 
      click(ev, 1) 
    } else {
      if (coordsOne[0] != 2){
        coordsOne = [2,2];
      }
    }
  };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.6, .8, 1.0);

  //plays animations
  requestAnimationFrame(tick);
}



var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
//Called by browser repeatedly
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();

  //Draw everything
  renderAllShapes();

  //Tell browser to update again when it has time
  requestAnimationFrame(tick);

}
let g_leftArmAnimation = false;
let g_leftFootAnimation = false;
let g_rightFootAnimation = false;
let g_penguinAnimation = false;
function updateAnimationAngles() {
  if (g_leftArmAnimation) {
    g_leftArmAngle = (-25 * Math.sin(4.50 * g_seconds));
  }
  if (g_penguinAnimation) {
    g_rightArmAngle = (25 * Math.sin(5.50 * g_seconds)) - 250;

    g_leftArmAngle = (-25 * Math.sin(5.50 * g_seconds + 3)) - 20;

    g_rightFeetAngle = (20 * Math.sin(5.50 * g_seconds + 3)) + 20;

    g_leftFeetAngle = (20 * Math.sin(5.50 * g_seconds)) + 20;

    if (g_rightFeetAngle >= 39) {
      g_beakTranslate -= .04;
    }

    if (g_rightFeetAngle <= 1) {
      g_beakTranslate += .04;
    }
    //console.log("right arm: " + g_rightArmAngle);
    //console.log("left arm: " + g_leftArmAngle);
    //console.log("right feet: " + g_rightFeetAngle);
    //console.log("left feet: " + g_leftFeetAngle);
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
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Get the storage location of size
  a_PointSize = gl.getUniformLocation(gl.program, 'a_PointSize');
  if (!a_PointSize) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  //Get the storange location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function handleClicks() {
  //animation buttons
  document.getElementById('penguinAnimationOn').onclick = function () { g_penguinAnimation = true; g_beakTranslate = 15.90; };
  document.getElementById('penguinAnimationOff').onclick = function () { g_penguinAnimation = false; g_beakTranslate = 15.90; };
  document.getElementById('penguinAnimationReset').onclick = function () { resetAnimation(); document.getElementById("leftArmSlide").value = -90; document.getElementById("rightArmSlide").value = -180; document.getElementById("leftFeetSlide").value = 0; document.getElementById("rightFeetSlide").value = 0; document.getElementById("beakSlide").value = 15.90; document.getElementById("leftHandSlider").value = 0; document.getElementById("rightHandSlider").value=0; };

  //camera settings
  document.getElementById('cameraReset').onclick = function () { resetCamera(); document.getElementById("angleXSlide").value = 0; document.getElementById("angleYSlide").value = 1; document.getElementById("angleZSlide").value = 0; };
  document.getElementById("angleXSlide").addEventListener('mousemove', function () { g_globalAngleX = this.value; renderAllShapes(); });
  document.getElementById("angleYSlide").addEventListener('mousemove', function () { g_globalAngleY = this.value; renderAllShapes(); });
  document.getElementById("angleZSlide").addEventListener('mousemove', function () { g_globalAngleZ = this.value; renderAllShapes(); });

  //penguin sliders
  document.getElementById("leftArmSlide").addEventListener('mousemove', function () { g_leftArmAngle = this.value; renderAllShapes(); });
  document.getElementById("rightArmSlide").addEventListener('mousemove', function () { g_rightArmAngle = this.value; renderAllShapes(); });
  document.getElementById("leftFeetSlide").addEventListener('mousemove', function () { g_leftFeetAngle = this.value; renderAllShapes(); });
  document.getElementById("rightFeetSlide").addEventListener('mousemove', function () { g_rightFeetAngle = this.value; renderAllShapes(); });
  document.getElementById("beakSlide").addEventListener('mousemove', function () { if (!g_penguinAnimation) { g_beakTranslate = this.value; renderAllShapes(); } });
  document.getElementById("leftHandSlider").addEventListener('mousemove', function () { g_leftHandAngle = this.value; renderAllShapes(); });
  document.getElementById("rightHandSlider").addEventListener('mousemove', function () { g_rightHandAngle = this.value; renderAllShapes(); });
}

//reset helper functions
function resetAnimation() {
  g_leftArmAngle = -90;
  g_rightArmAngle = -180;
  g_leftFeetAngle = 0;
  g_rightFeetAngle = 0;
  g_beakTranslate = 15.90;
  g_leftHandAngle = 0;
  g_rightHandAngle = 0;
}
function resetCamera() {
  g_globalAngle = 300;
  g_globalAngleX = 0;
  g_globalAngleY = 1;
  g_globalAngleZ = 0;
  g_globalAnglePos = 0;
}

let g_ShapesList = [];
function renderAllShapes() { //render scene
  var startTime = performance.now();
  //var globalRotMat = new Matrix4().rotate(g_globalAngleX,g_globalAngleY,g_globalAngleZ,0); //0,1,0
  let globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);
  globalRotMat.rotate(g_globalAnglePos, 0, 0, 1);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  //drawTriangle3D([-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]);

  //back body
  var penguinBody = new Cube();
  penguinBody.color = [0, 0.8, 1, 1];
  penguinBody.matrix.setTranslate(0, -.6, 0.0);
  penguinBody.matrix.rotate(0, 1, 0, 0);
  penguinBody.matrix.rotate(0, 0, 0, 1);
  penguinBody.matrix.scale(0.50, .7, .2);
  penguinBody.matrix.translate(-.5, 0, 0);
  penguinBody.render();
  //front body
  var penguinBackBody = new Cube();
  penguinBackBody.color = [1, 1, 1, 1];
  penguinBackBody.matrix.translate(0, -.6, -0.30);
  penguinBackBody.matrix.rotate(0, 1, 0, 0);
  penguinBackBody.matrix.rotate(0, 0, 0, 1);
  var yellowCoordinates = new Matrix4(penguinBackBody.matrix);
  penguinBackBody.matrix.scale(0.50, .7, .3);
  penguinBackBody.matrix.translate(-.5, 0, 0);
  penguinBackBody.render();
  //head
  var penguinHead = new Cube();
  penguinHead.color = [0, 0.8, 1, 1];
  penguinHead.matrix = yellowCoordinates; //connected to body
  penguinHead.matrix.translate(0, .70, 0);
  penguinHead.matrix.rotate(0, 0, 0, 1);
  penguinHead.matrix.scale(.5, .40, .5);
  penguinHead.matrix.translate(-.5, 0, -0.001)
  penguinHead.render();
  //tail
  var penguinTail = new Cube();
  penguinTail.color = [0, 0.8, 1, 1];
  var coordinateMat4 = new Matrix4(penguinBackBody.matrix);
  penguinTail.matrix = coordinateMat4;
  penguinTail.matrix.translate(0, 0, 1.0);
  penguinTail.matrix.rotate(0, 1, 0, 0);
  penguinTail.matrix.scale(1.0, .55, 1.05);
  penguinTail.render();
  //left arm
  var penguinLeftArm = new Cube();
  penguinLeftArm.color = [0, 0.8, 1, 1];
  var coordinatesMat3 = new Matrix4(penguinBackBody.matrix);
  penguinLeftArm.matrix = coordinatesMat3;
  penguinLeftArm.matrix.translate(1.0, .89, 0.73);
  penguinLeftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
  penguinLeftArm.matrix.scale(.59, .23, .3);
  penguinLeftArm.render();
  //right arm
  var penguinRightArm = new Cube();
  penguinRightArm.color = [0, 0.8, 1, 1];
  var coordinatesMat2 = new Matrix4(penguinBackBody.matrix);
  penguinRightArm.matrix = coordinatesMat2;
  penguinRightArm.matrix.translate(0, .89, 0.73);
  penguinRightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
  penguinRightArm.matrix.scale(.23, .59, .3);
  penguinRightArm.render();
  //left hand
  var penguinLeftHand = new Cube();
  penguinLeftHand.color = [0, 0.8, 1, 1];
  penguinLeftHand.matrix = coordinatesMat3; //connected to left arm
  penguinLeftHand.matrix.translate(1.0, 0, 0.01);
  penguinLeftHand.matrix.scale(.16, 1.09, .97);
  penguinLeftHand.matrix.rotate(g_leftHandAngle,0,1,0);
  penguinLeftHand.render();
  //right hand
  var penguinRightHand = new Cube();
  penguinRightHand.color = [0, 0.8, 1, 1];
  penguinRightHand.matrix = coordinatesMat2; //connected to right arm
  penguinRightHand.matrix.translate(0, 1.0, 0.01);
  penguinRightHand.matrix.scale(1.09, .16, .97);
  penguinRightHand.matrix.rotate(-g_rightHandAngle,1,0,0);
  penguinRightHand.render();
  //left feet
  var penguinLeftFeet = new Cube();
  penguinLeftFeet.color = [1, .7, 0, 1];
  penguinLeftFeet.matrix.translate(0, -.6, -0.10);
  penguinLeftFeet.matrix.rotate(g_leftFeetAngle, 1, 0, 0);
  penguinLeftFeet.matrix.rotate(0, 0, 0, 1);
  penguinLeftFeet.matrix.scale(0.30, 0.18, .5);
  penguinLeftFeet.matrix.translate(.30, -1.00, -0.9);
  penguinLeftFeet.render();
  //right feet
  var penguinRightFeet = new Cube();
  penguinRightFeet.color = [1, .7, 0, 1];
  penguinRightFeet.matrix.translate(0, -.6, -0.10);
  penguinRightFeet.matrix.rotate(g_rightFeetAngle, 45, 0, 0);
  penguinRightFeet.matrix.rotate(0, 0, 0, 1);
  penguinRightFeet.matrix.scale(0.30, 0.18, .5);
  penguinRightFeet.matrix.translate(-1.30, -1.00, -0.9);
  penguinRightFeet.render();
  //left eye
  var penguinLeftEye = new Cube();
  penguinLeftEye.color = [1, 1, 1, 1];
  penguinLeftEye.matrix.translate(0, -.6, -0.10);
  penguinLeftEye.matrix.rotate(0, 1, 0, 0);
  penguinLeftEye.matrix.rotate(0, 0, 0, 1);
  penguinLeftEye.matrix.scale(0.05, 0.15, .15);
  penguinLeftEye.matrix.translate(4.40, 5.40, -.20);
  penguinLeftEye.render();
  //left eye pupil
  var penguinLeftEyePupil = new Cube();
  penguinLeftEyePupil.color = [0.4, .4, .4, 1];
  penguinLeftEyePupil.matrix.translate(0, -.6, -0.10);
  penguinLeftEyePupil.matrix.rotate(0, 1, 0, 0);
  penguinLeftEyePupil.matrix.rotate(0, 0, 0, 1);
  penguinLeftEyePupil.matrix.scale(0.05, 0.1, .1);
  penguinLeftEyePupil.matrix.translate(4.80, 8.40, -.10);
  penguinLeftEyePupil.render();
  //right eye
  var penguinRightEye = new Cube();
  penguinRightEye.color = [1, 1, 1, 1];
  penguinRightEye.matrix.translate(0, -.6, -0.10);
  penguinRightEye.matrix.rotate(0, 1, 0, 0);
  penguinRightEye.matrix.rotate(0, 0, 0, 1);
  penguinRightEye.matrix.scale(0.05, 0.15, .15);
  penguinRightEye.matrix.translate(-5.40, 5.40, -.20);
  penguinRightEye.render();
  //right pupil
  var penguinRightEyePupil = new Cube();
  penguinRightEyePupil.color = [0.4, .4, .4, 1];
  penguinRightEyePupil.matrix.translate(0, -.6, -0.10);
  penguinRightEyePupil.matrix.rotate(0, 1, 0, 0);
  penguinRightEyePupil.matrix.rotate(0, 0, 0, 1);
  penguinRightEyePupil.matrix.scale(0.05, 0.1, .1);
  penguinRightEyePupil.matrix.translate(-5.80, 8.40, -.10);
  penguinRightEyePupil.render();
  //top of beak
  var penguinTopBeak = new Cube();
  penguinTopBeak.color = [1, .7, 0, 1];
  penguinTopBeak.matrix.translate(0, -.6, -0.10);
  penguinTopBeak.matrix.rotate(0, 1, 0, 0);
  penguinTopBeak.matrix.rotate(0, 0, 0, 1);
  penguinTopBeak.matrix.scale(0.20, 0.09, .22);
  penguinTopBeak.matrix.translate(-.5, 9.00, -1.9);
  penguinTopBeak.render();
  //bottom of beak
  var penguinBottomBeak = new Cube();
  penguinBottomBeak.color = [1, .7, 0, 1];
  penguinBottomBeak.matrix.translate(0, -.6, -0.10);
  penguinBottomBeak.matrix.rotate(0, 1, 0, 0);
  penguinBottomBeak.matrix.rotate(0, 0, 0, 1);
  penguinBottomBeak.matrix.scale(0.16, 0.05, .22);
  penguinBottomBeak.matrix.translate(-.5, g_beakTranslate, -1.9);
  penguinBottomBeak.render();
  //hat
  var penguinHat = new Pyramid();
  penguinHat.color = [1, 0, 1, 1];
  penguinHat.matrix = yellowCoordinates; //connected to head
  penguinHat.matrix.translate(0, .70, 0);
  penguinHat.matrix.rotate(270, 1, 0, 0)
  penguinHat.matrix.scale(.15, .15, .8);
  penguinHat.matrix.translate(3.4, -4, 0.34);
  penguinHat.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "theFPS");
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

// mouse control for rotation
function click(ev, check){
  let [x, y] = convertCoordinatesEvenToGL(ev);
  if (coordsOne[0] == 2){
    coordsOne = [x, y];
  }
  g_globalAngle += coordsOne[0]-x;
  g_globalAnglePos += coordsOne[1]-y;

  if (Math.abs(g_globalAngle / 360) > 1){
    g_globalAngle = 0;
  }
  if (Math.abs(g_globalAnglePos / 360) > 1){
    g_globalAnglePos = 0;
  }
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