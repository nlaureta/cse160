class Cube {
  // Creates a Cube object with default values
  constructor(M = new Matrix4(), C = [1.0, 1.0, 1.0, 1.0]) {
    this.type = "cube";
    this.color = C;
    this.matrix = M;
    this.textureNum = -2;
    this.cubeVerts32 = new Float32Array([
      -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5,
      -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
      //LEFT
      -0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5,
      -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
      //RIGHT
      0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5,
      0.5,0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
      //TOP
      -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
      -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
      //BACK
      0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5,
      -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5,
      //BOTTOM
      -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
      -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5
    ]);
    this.cubeVerts = [
      0,0,0, 1,1,0, 1,0,0,
      0,0,0, 0,1,0, 1,1,0,

      0,1,0, 0,1,1, 1,1,1,
      0,1,0, 1,1,1, 1,1,0,

      1,1,0, 1,1,1, 1,0,0,
      1,0,0, 1,1,1, 1,0,1,
    
      0,1,0, 0,1,1, 0,0,0,
      0,0,0, 0,1,1, 0,0,1,

      0,0,0, 0,0,1, 1,0,1,
      0,0,0, 1,0,1, 1,0,0,

      0,0,1, 1,1,1, 1,0,1,
      0,0,1, 0,1,1, 1,1,1,
    ];
    this.cubeUV32 = new Float32Array([
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      // 0.75,0.5, 0.75,0.25, 1,0.25, 0.75,0.5, 1,0.25, 1,0.5,
      // LEFT
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      // 0.25,0.5, 0.25,0.25, 0.5,0.25, 0.25,0.5, 0.5,0.25, 0.5,0.5,
      // RIGHT
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      // 0.5,0.75, 0.5,0.5, 0.75,0.5, 0.5,0.75, 0.75,0.5, 0.75,0.75,
      // TOP
      1,0, 1,1, 0,1, 1,0, 0,1, 0,0,
      // 0.25, 0.25, 0.25, 0.5, 0, 0.5, 0.25, 0.25, 0, 0.5, 0, 0.25,
      // BACK
      0,1, 0,0, 1,1, 1,1, 0,0, 1,0,
      // 0.5,0.5, 0.5,0.25, 0.75,0.5, 0.75,0.5, 0.5,0.25, 0.75,0.25,
      // BOTTOM
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      //0.5,0.25, 0.5,0, 0.75,0, 0.5,0.25, 0.75,0, 0.75,0.25
    ]);
  }

  //render shapes
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;
    //console.log(this.textureNum);
    gl.uniform1i(u_whichTexture, this.textureNum);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // drawTriangle3D([0,0,0 , 1,1,0, 1,0,0 ]);
    //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //front of cubes
    drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
    // drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]); //right
    // drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

    //back of cube
    drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [1,0, 0,1, 0,0]);
    drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1]);
    // drawTriangle3D([0, 0, 1, 1, 1, 1, 1, 0, 1]);
    // drawTriangle3D([0, 0, 1, 0, 1, 1, 1, 1, 1]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

    //top of cube
    drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
    drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);
    // drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
    // drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);

    //bottom
    drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0]);
    drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1]);
    // drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);
    // drawTriangle3D([0, 0, 0, 1, 0, 1, 1, 0, 0]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

    //right side of cube
    drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
    drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
    // drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);
    // drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 0, 1]);

    //left side of cube
    drawTriangle3DUV([0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1]);
    drawTriangle3DUV([0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0]);
    // drawTriangle3D([0, 0, 0, 0, 1, 0, 0, 1, 1]);
    // drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 0, 1]);
  }

  renderfast() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts = [];

    allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
    allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);

    allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
    allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);

    allverts = allverts.concat([1,1,0, 1,1,1, 1,0,0]);
    allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);
    
    allverts = allverts.concat([0,1,0, 0,1,1, 0,0,0]);
    allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);

    allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
    allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);

    allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
    allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
    drawTriangle3D(allverts);
  }


  renderfaster() {
    var n = this.cubeVerts32.length/3;
    var rgba = this.color;
    // Pass texture number
    gl.uniform1i(u_whichTexture, this.textureNum);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    if (g_vertexBuffer == null) {
      initTriangle3D(this.cubeVerts32, this.cubeUV32);
    }

    //gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, this.cubeUV32, gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, n);

  }

}

