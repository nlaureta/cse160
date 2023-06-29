class Triangle {
  construtor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  //render shapes
  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // Pass the position of a point to a_Position variable
    // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the point size
    gl.uniform1f(a_PointSize, size);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Draw
    //gl.drawArrays(gl.POINTS, 0, 1);
    var d = this.size / 200.0
    drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
  }
}

function drawTriangle(vertices) {
  // var vertices = new Float32Array([
  //   0, 0.5,   -0.5, -0.5,   0.5, -0.5
  // ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n)
  //return n;
}

//function for draw picture button
function drawPicture(vertices, color) {
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  //color
  console.log(color[0]);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n)
  //return n;
}

//stars for draw picture button (20 triangles total including tent)
var starsObj = [
  {
    "type": "triangle",
    "position": [
      -0.32,
      0.49
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      -0.52,
      0.69
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "9"
  },
  {
    "type": "triangle",
    "position": [
      0.32,
      0.59
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "9"
  },
  {
    "type": "triangle",
    "position": [
      0.42,
      0.29
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      0.72,
      0.79
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      0.0,
      0.79
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      -0.72,
      0.29
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      0.72,
      0.49
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      0.82,
      0.29
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      -0.52,
      0.19
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },



  {
    "type": "triangle",
    "position": [
      0.1,
      0.49
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  },
  {
    "type": "triangle",
    "position": [
      0.42,
      0.79
    ],
    "color": [
      1.0,
      1.0,
      1.0,
      1
    ],
    "size": "10"
  }
]