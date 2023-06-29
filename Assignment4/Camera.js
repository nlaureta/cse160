class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.fov = 70;
    }

    moveForward(speed) {
        var f = new Vector3(this.at.elements).sub(this.eye); // d=at-eye
        f.normalize(); //d = d.normalize
        f.mul(speed);
        this.eye.add(f); // eye = eye + d
        this.at.add(f); //at = at + d
    }

    moveBackwards(speed) {
        var b = new Vector3(this.eye.elements).sub(this.at); // d=at-eye
        b.normalize(); //d = d.normalize
        b.mul(speed);
        this.eye.add(b); // eye = eye + d
        this.at.add(b); //at = at + d

    }

    moveLeft(speed) {
        var l = new Vector3(this.eye.elements).sub(this.at);;
        l.normalize();
        var left = Vector3.cross(l, this.up); //left = d x up
        left.normalize();
        left.mul(speed);
        this.at.add(left);
        this.eye.add(left);
        //console.log("left");
    }
    moveRight(speed) {
        var r = new Vector3(this.eye.elements).sub(this.at);
        r.normalize();
        var right = Vector3.cross(r, this.up); //left = d x up
        right.normalize();
        right.mul(speed);
        this.at.sub(right);
        this.eye.sub(right);
        //console.log("right");
    }

    panLeft(speed = 1) {
        var pl = new Vector3(this.at.elements).sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(10 * speed, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(pl);
        this.at = new Vector3(this.eye.elements).add(f_prime);
    }
    panRight(speed = 1) {
        var pr = new Vector3(this.at.elements).sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-10 * speed, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(pr);
        this.at = new Vector3(this.eye.elements).add(f_prime);
    }
}