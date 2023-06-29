let g_penguinAnimation = false;
class Penguin {
    constructor(M = new Matrix4()) {
        this.type = "penguin";
        this.matrix = M;
    }

    
updateAnimationAngles(time) {
    g_leftArmAngle = (-25 * Math.sin(4.50 * time));
  if (g_penguinAnimation) {
    g_rightArmAngle = (25 * Math.sin(5.50 * time)) - 250;

    g_leftArmAngle = (-25 * Math.sin(5.50 * time + 3)) - 20;

    g_rightFeetAngle = (20 * Math.sin(5.50 * time + 3)) + 20;

    g_leftFeetAngle = (20 * Math.sin(5.50 * time)) + 20;

    if (g_rightFeetAngle >= 39) {
      g_beakTranslate -= .04;
    }

    if (g_rightFeetAngle <= 1) {
      g_beakTranslate += .04;
    }
  }
}

    render() {
        var penguinBody = new Cube();
        penguinBody.matrix.translate(-47,0, -7);//
        penguinBody.matrix.rotate(240, 0, 1, 0);//
        penguinBody.color = [0, 0.8, 1, 1];
        penguinBody.matrix.translate(0, -.6, 0.0);
        penguinBody.matrix.rotate(0, 1, 0, 0);
        penguinBody.matrix.rotate(0, 0, 0, 1);
        penguinBody.matrix.scale(0.50, .7, .2);
        penguinBody.matrix.translate(-.5, 0, 0);
        penguinBody.matrix.translate(-40,5.1, -80);//
        //penguinBody.matrix.rotate(50, 0, 1, 0);
        penguinBody.normalMatrix.setInverseOf(penguinBody.matrix).transpose();
        penguinBody.render();
        //front body
        var penguinBackBody = new Cube();
        penguinBackBody.matrix.translate(-47,0, -7);//
        penguinBackBody.matrix.rotate(240, 0, 1, 0);
        penguinBackBody.color = [1, 1, 1, 1];
        penguinBackBody.matrix.translate(0, -.6, -0.30);
        penguinBackBody.matrix.rotate(0, 1, 0, 0);
        penguinBackBody.matrix.rotate(0, 0, 0, 1);
        var yellowCoordinates = new Matrix4(penguinBackBody.matrix);
        penguinBackBody.matrix.scale(0.50, .7, .3);
        penguinBackBody.matrix.translate(-.5, 0, 0);
        penguinBackBody.matrix.translate(-40,5.1, -53.3);//
        //penguinBackBody.matrix.rotate(50, 0, 1, 0);//
        penguinBackBody.render();
        //head
        var penguinHead = new Cube();
        penguinHead.color = [0, 0.8, 1, 1];
        penguinHead.matrix = yellowCoordinates; //connected to body
        penguinHead.matrix.translate(0, .70, 0);
        penguinHead.matrix.rotate(0, 0, 0, 1);
        penguinHead.matrix.scale(.5, .40, .5);
        penguinHead.matrix.translate(-.5, 0, -0.001)
        penguinHead.matrix.translate(-40,8.93, -32);//
        //penguinHead.matrix.rotate(50, 0, 1, 0);//
        penguinHead.render();
        //tail
        var penguinTail = new Cube();
        penguinTail.color = [0, 0.8, 1, 1];
        var coordinateMat4 = new Matrix4(penguinBackBody.matrix);
        penguinTail.matrix = coordinateMat4;
        penguinTail.matrix.translate(0, 0, 1.0);
        penguinTail.matrix.rotate(0, 1, 0, 0);
        penguinTail.matrix.scale(1.0, .55, 1.05);
        //penguinTail.matrix.rotate(50, 0, 1, 0);
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
        penguinLeftHand.matrix.rotate(g_leftHandAngle, 0, 1, 0);
        penguinLeftHand.render();
        //right hand
        var penguinRightHand = new Cube();
        penguinRightHand.color = [0, 0.8, 1, 1];
        penguinRightHand.matrix = coordinatesMat2; //connected to right arm
        penguinRightHand.matrix.translate(0, 1.0, 0.01);
        penguinRightHand.matrix.scale(1.09, .16, .97);
        penguinRightHand.matrix.rotate(-g_rightHandAngle, 1, 0, 0);
        penguinRightHand.render();
        //left feet
        var penguinLeftFeet = new Cube();
        penguinLeftFeet.matrix.translate(-47,0, -7);//
        penguinLeftFeet.matrix.rotate(240, 0, 1, 0);//
        penguinLeftFeet.color = [1, .7, 0, 1];
        penguinLeftFeet.matrix.translate(-20, 3, -16);
        penguinLeftFeet.matrix.rotate(g_leftFeetAngle, 1, 0, 0);
        penguinLeftFeet.matrix.rotate(0, 0, 0, 1);
        penguinLeftFeet.matrix.scale(0.30, 0.18, .5);
        penguinLeftFeet.matrix.translate(.30, -1.00, -0.9);
        penguinLeftFeet.render();
        //right feet
        var penguinRightFeet = new Cube();
        penguinRightFeet.matrix.translate(-47,0, -7);//
        penguinRightFeet.matrix.rotate(240, 0, 1, 0);//
        penguinRightFeet.color = [1, .7, 0, 1];
        penguinRightFeet.matrix.translate(-20, 3, -16);//
        penguinRightFeet.matrix.rotate(g_rightFeetAngle, 45, 0, 0);
        penguinRightFeet.matrix.rotate(0, 0, 0, 1);
        penguinRightFeet.matrix.scale(0.30, 0.18, .5);
        penguinRightFeet.matrix.translate(-1.30, -1.00, -0.9);
        penguinRightFeet.render();
        //left eye
        var penguinLeftEye = new Cube();
        penguinLeftEye.matrix.translate(-47,0, -7);//
        penguinLeftEye.matrix.rotate(240, 0, 1, 0);//
        penguinLeftEye.color = [1, 1, 1, 1];
        penguinLeftEye.matrix.translate(-20, 3, -16.17);//
        penguinLeftEye.matrix.rotate(0, 1, 0, 0);
        penguinLeftEye.matrix.rotate(0, 0, 0, 1);
        penguinLeftEye.matrix.scale(0.05, 0.15, .15);
        penguinLeftEye.matrix.translate(4.40, 5.40, -.20);
        penguinLeftEye.render();
        //left eye pupil
        var penguinLeftEyePupil = new Cube();
        penguinLeftEyePupil.matrix.translate(-47,0, -7);//
        penguinLeftEyePupil.matrix.rotate(240, 0, 1, 0);//
        penguinLeftEyePupil.textureNum = 0;
        penguinLeftEyePupil.color = [0.4, .4, .4, 1];
        penguinLeftEyePupil.matrix.translate(-20, 3, -16.17);//
        penguinLeftEyePupil.matrix.rotate(0, 1, 0, 0);
        penguinLeftEyePupil.matrix.rotate(0, 0, 0, 1);
        penguinLeftEyePupil.matrix.scale(0.05, 0.1, .1);
        penguinLeftEyePupil.matrix.translate(4.80, 8.40, -.10);
        penguinLeftEyePupil.render();
        //right eye
        var penguinRightEye = new Cube();
        penguinRightEye.color = [1, 1, 1, 1];
        penguinRightEye.matrix.translate(-47,0, -7);//
        penguinRightEye.matrix.rotate(240, 0, 1, 0);//
        penguinRightEye.matrix.translate(-20, 3, -16.17);//
        penguinRightEye.matrix.rotate(0, 1, 0, 0);
        penguinRightEye.matrix.rotate(0, 0, 0, 1);
        penguinRightEye.matrix.scale(0.05, 0.15, .15);
        penguinRightEye.matrix.translate(-5.40, 5.40, -.20);
        penguinRightEye.render();
        //right pupil
        var penguinRightEyePupil = new Cube();
        penguinRightEyePupil.textureNum = 0;
        penguinRightEyePupil.matrix.translate(-47,0, -7);//
        penguinRightEyePupil.matrix.rotate(240, 0, 1, 0);//
        penguinRightEyePupil.color = [0.4, .4, .4, 1];
        penguinRightEyePupil.matrix.translate(-20, 3, -16.17);//
        penguinRightEyePupil.matrix.rotate(0, 1, 0, 0);
        penguinRightEyePupil.matrix.rotate(0, 0, 0, 1);
        penguinRightEyePupil.matrix.scale(0.05, 0.1, .1);
        penguinRightEyePupil.matrix.translate(-5.80, 8.40, -.10);
        penguinRightEyePupil.render();
        //top of beak
        var penguinTopBeak = new Cube();
        penguinTopBeak.matrix.translate(-47,0, -7);//
        penguinTopBeak.matrix.rotate(240, 0, 1, 0);//
        penguinTopBeak.color = [1, .7, 0, 1];
        penguinTopBeak.matrix.translate(-20, 3, -16);//
        penguinTopBeak.matrix.rotate(0, 1, 0, 0);
        penguinTopBeak.matrix.rotate(0, 0, 0, 1);
        penguinTopBeak.matrix.scale(0.20, 0.09, .22);
        penguinTopBeak.matrix.translate(-.5, 9.00, -1.9);
        penguinTopBeak.render();
        //bottom of beak
        var penguinBottomBeak = new Cube();
        penguinBottomBeak.matrix.translate(-47,0, -7);//
        penguinBottomBeak.matrix.rotate(240, 0, 1, 0);//
        penguinBottomBeak.color = [1, .7, 0, 1];
        penguinBottomBeak.matrix.translate(-20, 3, -16);//
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
    }
}