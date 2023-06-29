// ColoredPoint.js (c) 2012 matsuda

//--------------Credits----------------------------
//https://www.youtube.com/watch?v=-55GRq-hUyE
//https://getbootstrap.com/docs/5.0/getting-started/introduction/
//Professor's videos: https://www.youtube.com/watch?v=rfyhLGeylGA&list=PLbyTU_tFIkcMK5FiV6btXxHQAy15p0j7X 

// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
   uniform float a_PointSize; 
   void main() {
     gl_Position = a_Position;
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

function main() {
  // Retrieve <canvas> element
  setupWebGL();
  // Initialize shaders
  connectVariablesToGLSL();

  // Initilizes clicks 
  handleClicks();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;

  //1 if button held down. 
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); // better performance
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

//Global Variables for handleClicks()
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
let g_selectedType = POINT;
let g_segCount = 10;
var drawButtonClicked = false;
function handleClicks() {
  //Mode Button Events
  document.getElementById('pointButton').onclick = function () { g_selectedType = POINT };
  document.getElementById('triangleButton').onclick = function () { g_selectedType = TRIANGLE };
  document.getElementById('circleButton').onclick = function () { g_selectedType = CIRCLE };

  // Draw button: A Tent at night, 20 Triangles total
  document.getElementById('drawButton').onclick = function () { //g_list = [];  
    drawButtonClicked = true;
    //tent roof
    drawPicture([0, 0.4, -0.5, -0.1, 0.5, -0.1], [1.0, 0.48, 0.0, 1.0]); //roof triangle
    //tent body
    drawPicture([0, -0.5, -0.45, -0.1, 0.45, -0.1], [1.0, 0.88, 0.0, 1.0]); //below roof, top triangle
    drawPicture([0, -0.5, 0.45, -1.0, -0.45, -1.0], [1.0, 0.88, 0.0, 1.0]);// below roof, bottom triangle
    drawPicture([0, -0.5, -0.45, -0.1, -0.45, -1.0], [1.0, 0.88, 0.0, 1.0]);// below roof, left triangle
    drawPicture([0, -0.5, 0.45, -1.0, 0.45, -0.1], [1.0, 0.88, 0.0, 1.0]);// below roof, right triangle
    //tent door
    drawPicture([0, -0.5, 0.1, -1.0, -0.1, -1.0], [1.0, 1.0, 1.0, 1.0]);// below roof, right triangle
    //moon
    drawPicture([-1.0, 1.0, -1.0, 0.5, -0.6, .62], [1.0, 0.95, .78, 1.0]); //top moon triangle
    drawPicture([-1.0, 1.0, -0.6, .62, -0.5, 1.0], [1.0, 0.95, .78, 1.0]);  //bottom moon triangle
    //stars
    g_list = displayAllStars(starsObj);
    renderAllShapes();
  }; //top xy, left xy, right xy

  //Clear button
  document.getElementById('clear').onclick = function () { drawButtonClicked = false; g_list = []; renderAllShapes(); };

  //Color Slider Events
  var input = document.querySelectorAll("input");
  for (var i = 0; i < input.length; i++) {
    input[i].addEventListener("input", function () {
      g_selectedColor[0] = (document.getElementById("redSlide").value) / 100;
      g_selectedColor[1] = (document.getElementById("greenSlide").value) / 100;
      g_selectedColor[2] = (document.getElementById("blueSlide").value) / 100;
      //console.log(g_selectedColor[0]);
      var display = document.getElementById("display");
      display.style.background = "rgb(" + (g_selectedColor[0] * 255) + ", " + (g_selectedColor[1] * 255) + "," + (g_selectedColor[2] * 255) + ")";
    });
  }

  //Size Slider Events
  document.getElementById("sizeSlide").addEventListener('mouseup', function () { g_slideSize = this.value; });
  document.getElementById("segSlide").addEventListener('mouseup', function () { g_segCount = this.value; });
}

function renderAllShapes() {
  if (drawButtonClicked == false)
    gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_list.length;
  for (var i = 0; i < len; i++) {
    g_list[i].render();
  }
}
//Global Variables for click(ev)
var g_list = []; //Array for all shape info
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_slideSize = 5;
function click(ev) {
  let [x, y] = convertCoordinatesEvenToGL(ev);

  let mode;
  //console.log(g_selectedType);
  if (g_selectedType == TRIANGLE) {
    mode = new Triangle();
  } else if (g_selectedType == POINT) {
    mode = new Point();
  } else {
    mode = new Circle();
    mode.segments = g_segCount;
  }

  mode.position = [x, y];
  mode.color = g_selectedColor.slice();
  mode.size = g_slideSize;

  g_list.push(mode);

  renderAllShapes();
}

//function to display all stars on draw picture button
function displayAllStars(starArray){
  var list = [];
  let mode;
  for(var i = 0; i < starArray.length; i++) {
    mode = new Triangle();
    mode.position = starArray[i].position;
    mode.color = starArray[i].color;
    mode.size = starArray[i].size;
    list.push(mode);
  }
  return list;
}