class Cube {
  // Creates a Cube object with default values
  constructor(M = new Matrix4(), C = [1.0, 1.0, 1.0, 1.0], N = new Matrix4()) {
    this.type = "cube";
    this.color = C;
    this.matrix = M;
    this.normalMatrix = N;
    this.textureNum = -2;
    this.cubeVerts32 = new Float32Array([

      //left
      0, 0, 0, 1, 1, 0, 1, 0, 0,
      0, 0, 0, 0, 1, 0, 1, 1, 0,
      //bottom
      0, 1, 0, 0, 1, 1, 1, 1, 1,
      0, 1, 0, 1, 1, 1, 1, 1, 0,
      //right side of cube
      1, 0, 0, 1, 1, 1, 1, 1, 0,
      1, 0, 0, 1, 1, 1, 1, 0, 1,
      //left side of cube
      0, 0, 0, 0, 1, 0, 0, 0, 1,
      0, 1, 1, 0, 1, 0, 0, 0, 1,
      //top
      0, 0, 0, 0, 0, 1, 1, 0, 1,
      0, 0, 0, 1, 0, 1, 1, 0, 0,
      //back of cube
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 1, 0, 1, 1, 1, 1, 1,
    ]);
    this.cubeVerts = [
      1, 0, 0, 1, 0, 0,
      1, 0, 1, 1, 0, 1,

      //bottom
      0, 0, 0, 1, 1, 1,
      0, 0, 1, 1, 1, 0,

      //right side of cube
      1, 0, 0, 1, 1, 1,
      1, 0, 0, 1, 0, 0,

      //left side of cube
      0, 0, 0, 1, 1, 0,
      1, 1, 0, 1, 1, 0,

      //top
      0, 0, 0, 1, 1, 1,
      0, 0, 1, 1, 1, 0,

      //back of cube
      0, 0, 1, 1, 1, 0,
      0, 0, 0, 1, 1, 1,
    ];
    this.cubeUV32 = new Float32Array([
      1, 0, 0, 1, 0, 0,
      1, 0, 1, 1, 0, 1,

      //bottom
      0, 0, 0, 1, 1, 1,
      0, 0, 1, 1, 1, 0,

      //right side of cube
      1, 0, 0, 1, 1, 1,
      1, 0, 0, 1, 0, 0,

      //left side of cube
      0, 0, 0, 1, 1, 0,
      1, 1, 0, 1, 1, 0,

      //top
      0, 0, 0, 1, 1, 1,
      0, 0, 1, 1, 1, 0,

      //back of cube
      0, 0, 1, 1, 1, 0,
      0, 0, 0, 1, 1, 1,
    
    ]);
    this.cubeNormals = new Float32Array([
      0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, 0, -1, 0, 0, -1, 0, 0, -1,

      //bottom
      0, 1, 0, 0, 1, 0, 0, 1, 0,
      0, 1, 0, 0, 1, 0, 0, 1, 0,

      //right side of cube
      1, 0, 0, 1, 0, 0, 1, 0, 0,
      1, 0, 0, 1, 0, 0, 1, 0, 0,

      //left side of cube
      -1, 0, 0, -1, 0, 0, -1, 0, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 0,

      //top
      0, -1, 0, 0, -1, 0, 0, -1, 0,
      0, -1, 0, 0, -1, 0, 0, -1, 0,

      //back of cube
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
    
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

    //gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
    
    //fine
    drawTriangle3DUVNormal([0,0,0 , 1,1,0, 1,0,0],[1,0 , 0,1, 0,0],[0,0,-1 ,0,0,-1, 0,0,-1]);
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [1,0, 1,1, 0,1], [0,0, -1,0,0, -1, 0,0, -1]);

    // drawTriangle3D([0,0,0 , 1,1,0, 1,0,0 ]);
    //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    //bottom
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
    // drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
    // drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

    //front of cubes
    // drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
    // drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

    //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    //right side of cube
    drawTriangle3DUVNormal( [1,0,0, 1,1,1, 1,1,0], [1,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0] );
    drawTriangle3DUVNormal( [1,0,0, 1,1,1, 1,0,1], [1,0, 0,1, 0,0], [1,0,0, 1,0,0, 1,0,0] );
    
    //left side of cube
    //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
    drawTriangle3DUVNormal( [0,0,0, 0,1,0, 0,0,1], [0,0, 0,1, 1,0], [-1,0,0, -1,0,0, -1,0,0] );
    drawTriangle3DUVNormal( [0,1,1, 0,1,0, 0,0,1], [1,1, 0,1, 1,0], [-1,0,0, -1,0,0, -1,0,0] );

    //top
    //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

    //back of cube
    //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
    drawTriangle3DUVNormal( [0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1] );
    drawTriangle3DUVNormal( [0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1] );
    
    
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
      initTriangle3D(this.cubeVerts32, this.cubeUV32, this.cubeNormals);
    }

    //gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, this.cubeUV32, gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, n);

  }

}

