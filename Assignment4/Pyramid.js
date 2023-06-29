class Pyramid {
  // Creates a Cube object with default values
  constructor(M = new Matrix4(), C = [1.0, 1.0, 1.0, 1.0]) {
    this.type = "pyramid";
    this.color = C;
    this.matrix = M;
  }

  //render shapes
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // drawTriangle3D([0,0,0 , 1,1,0, 1,0,0 ]);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //front
    drawTriangle3D([1, -1, 0, 0, 0, 1, 1, 1, 0]);

    //back
    drawTriangle3D([-1, -1, 0, 0, 0, 1, -1, 1, 0]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

    //bottom
    drawTriangle3D([1, -1, 0, -1, -1, 0, -1, 1, 0]);
    drawTriangle3D([1, -1, 0, -1, 1, 0, 1, 1, 0]);

    gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
    //right side
    drawTriangle3D([1, 1, 0, 0, 0, 1, -1, 1, 0]);

    //left side
    drawTriangle3D([1, -1, 0, 0, 0, 1, -1, -1, 0]);
   }
}

