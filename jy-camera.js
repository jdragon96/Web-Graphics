export const MouseType = {
  LEFT: Symbol(0),
  WHEEL: Symbol(1),
  RIGHT: Symbol(2),
  NONE: Symbol(100),
};

export const MouseState = {
  RELEASE: Symbol(0),
  PRESSED: Symbol(1),
};

export class Camera {
  constructor(canvasObject, camPosVec3, targetPosVec3) {
    this.canvas = canvasObject;
    // 행렬 초기화
    {
      this.view = new Float32Array(16);
      this.proj = new Float32Array(16);
      mat4.identity(this.view);
      mat4.identity(this.proj);
    }
    // 벡터 세팅
    {
      this.camPosVec3 = camPosVec3;
      this.targetPosVec3 = targetPosVec3;
      this.frontVec = [
        this.targetPosVec3[0] - this.camPosVec3[0],
        this.targetPosVec3[1] - this.camPosVec3[1],
        this.targetPosVec3[2] - this.camPosVec3[2],
      ];
      vec3.normalize(this.frontVec, this.frontVec);
      this.upVec = [0, 0, 1];
      this.rightVec = [0, 0, 0];
      vec3.cross(this.rightVec, this.frontVec, this.upVec);
      vec3.normalize(this.rightVec, this.rightVec);
      this.distance = vec3.distance(this.camPosVec3, this.targetPosVec3);

      this.isPressed = false;
      this.mouseType = MouseType.NONE;
      this.mouseState = MouseState.RELEASE;

      mat4.lookAt(this.view, this.camPosVec3, this.targetPosVec3, this.upVec);
    }
    // 캔버스 이벤트 세팅
    {
      canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        if (this.mouseType == MouseType.NONE) {
          return;
        }
        if (this.mouseState == MouseState.RELEASE) {
          this.prevPosX = x;
          this.prevPosY = y;
          this.mouseState = MouseState.PRESSED;
          return;
        } else {
          this.Orbit(this.prevPosX - x, y - this.prevPosY);
          this.prevPosX = x;
          this.prevPosY = y;
        }
      });

      canvas.addEventListener("mousedown", (event) => {
        if (event.button === 1) {
          this.mouseType = MouseType.WHEEL;
        } else if (event.button == 0) {
          this.mouseType = MouseType.LEFT;
        } else if (event.button == 2) {
          this.mouseType = MouseType.RIGHT;
        }
      });
      canvas.addEventListener("mouseup", (event) => {
        this.mouseType = MouseType.NONE;
        this.mouseState = MouseState.RELEASE;
      });
    }
  }

  Orbit(deltaX, deltaY) {
    var sensitivity = 0.005;
    this.delteLon = deltaX * sensitivity;
    this.delteLat = deltaY * sensitivity;
    {
      this.frontVec[0] =
        this.frontVec[0] * Math.cos(this.delteLon) -
        this.rightVec[0] * Math.sin(this.delteLon);
      this.frontVec[1] =
        this.frontVec[1] * Math.cos(this.delteLon) -
        this.rightVec[1] * Math.sin(this.delteLon);
      this.frontVec[2] =
        this.frontVec[2] * Math.cos(this.delteLon) -
        this.rightVec[2] * Math.sin(this.delteLon);
      vec3.normalize(this.frontVec, this.frontVec);
      vec3.cross(this.rightVec, this.frontVec, this.upVec);
      vec3.normalize(this.rightVec, this.rightVec);
      this.frontVec[0] =
        this.frontVec[0] * Math.cos(this.delteLat) +
        this.upVec[0] * Math.sin(this.delteLat);
      this.frontVec[1] =
        this.frontVec[1] * Math.cos(this.delteLat) +
        this.upVec[1] * Math.sin(this.delteLat);
      this.frontVec[2] =
        this.frontVec[2] * Math.cos(this.delteLat) +
        this.upVec[2] * Math.sin(this.delteLat);
      vec3.normalize(this.frontVec, this.frontVec);
      vec3.cross(this.upVec, this.rightVec, this.frontVec);
      vec3.normalize(this.rightVec, this.rightVec);
      this.camPosVec3[0] =
        this.targetPosVec3[0] + this.frontVec[0] * this.distance;
      this.camPosVec3[1] =
        this.targetPosVec3[1] + this.frontVec[1] * this.distance;
      this.camPosVec3[2] =
        this.targetPosVec3[2] + this.frontVec[2] * this.distance;
      this.frontVec = vec3.normalize(this.frontVec, this.frontVec);
    }
    mat4.lookAt(this.view, this.camPosVec3, this.targetPosVec3, this.upVec);
  }

  Translate(deltaX, deltaY) {
    var sensitivity = 0.01;
    {
      this.camPosVec3[0] += this.rightVec[0] * deltaX * sensitivity;
      this.camPosVec3[1] += this.rightVec[1] * deltaX * sensitivity;
      this.camPosVec3[2] += this.rightVec[2] * deltaX * sensitivity;
      this.targetPosVec3[0] += this.rightVec[0] * deltaX * sensitivity;
      this.targetPosVec3[1] += this.rightVec[1] * deltaX * sensitivity;
      this.targetPosVec3[2] += this.rightVec[2] * deltaX * sensitivity;
    }
    // Y축 처리
    {
      this.camPosVec3[0] += this.upVec[0] * deltaY * sensitivity;
      this.camPosVec3[1] += this.upVec[1] * deltaY * sensitivity;
      this.camPosVec3[2] += this.upVec[2] * deltaY * sensitivity;
      this.targetPosVec3[0] += this.upVec[0] * deltaY * sensitivity;
      this.targetPosVec3[1] += this.upVec[1] * deltaY * sensitivity;
      this.targetPosVec3[2] += this.upVec[2] * deltaY * sensitivity;
    }
    mat4.lookAt(this.view, this.camPosVec3, this.targetPosVec3, this.upVec);
    // console.log(`${this.upVec}`);
  }

  Zoom(zoom) {}
}
