// DrawTriangle.js (c) 2012 matsuda
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('cnv1');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
  //let v1 = new Vector3([2.25,2.25,0]); 
  //drawVector(v1, "red");
}

function drawVector(v, color) {
  var canvas = document.getElementById('cnv1');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }
  var ctx = canvas.getContext('2d');

  ctx.strokeStyle = color;
  let cx = canvas.width / 2;
  let cy = canvas.height / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo((v.elements[0] * 20) + cx, (v.elements[1] * -20) + cy);
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('cnv1');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }
  var ctx = canvas.getContext('2d');

  let x1 = document.getElementById("x1").value;
  let y1 = document.getElementById("y1").value;
  let x2 = document.getElementById("x2").value;
  let y2 = document.getElementById("y2").value;

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  // console.log(x1);
  // console.log(y1);
  // console.log(x2);
  // console.log(y2);
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('cnv1');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }
  var ctx = canvas.getContext('2d');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let x1 = document.getElementById("x1").value;
  let y1 = document.getElementById("y1").value;
  let x2 = document.getElementById("x2").value;
  let y2 = document.getElementById("y2").value;

  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  let scalar = document.getElementById("scalar").value;
  let select = document.getElementById("operator-select").value;

  //console.log(select);
  //console.log(scalar);
  if (select == "add") {
    v1.add(v2);
    //console.log(v1);
    drawVector(v1, "green");
  } else if (select == "sub") {
    v1.sub(v2);
    //console.log(v1);
    drawVector(v1, "green");
  } else if (select == "mult") {
    v1.mul(scalar);
    v2.mul(scalar);
    drawVector(v1, "green");
    drawVector(v2, "green");
  } else if (select == "div") {
    v1.div(scalar);
    v2.div(scalar);
    drawVector(v1, "green");
    drawVector(v2, "green");
  } else if (select == "mag") {
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  } else if (select == "norm") {
    v1.normalize();
    v2.normalize();
    drawVector(v1, "green");
    drawVector(v2, "green");
  } else if (select == "angle") {
    angleBetween(v1, v2);
  } else if (select == "area") {
    areaTriangle(v1, v2);
  }
}

function angleBetween(v1, v2) {
  // console.log("Dot: " + Vector3.dot(v1,v2));
  // const angle = Math.acos(Vector3.dot(v1,v2)) * (180 / Math.PI);
  // console.log("Angle: " + angle);
  let v1mag = v1.magnitude();
  let v2mag = v2.magnitude();
  let dotprod = Vector3.dot(v1, v2);

  let cosalpha = dotprod / (v1mag * v2mag);

  const angle = Math.acos(cosalpha) * (180 / Math.PI);

  console.log("Angle: " + angle);

}

function areaTriangle(v1, v2) {
  const area = (1 / 2) * Vector3.cross(v1, v2).magnitude();
  console.log("Area of the triangle: " + area);
}


