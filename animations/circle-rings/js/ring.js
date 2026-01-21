class Ring {
  constructor(radius, length, phi, omega, color) {
    this._radius = radius;
    this._length = length;
    this._phi = phi;
    this._color = color;
    this._omega = omega;

    this.t = 0;
  }

  update(t) {
    this.t = t;
  }

  draw(ctx) {
    const theta = this.t * this._omega * Math.PI * 2 - this._phi;

    ctx.save();
    ctx.strokeStyle = this._color.rgba;
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.rotate(theta);

    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, this._length);
    ctx.stroke();

    ctx.restore();
  }
}

class Circle {
  constructor(radius, color) {
    this._radius = radius;
    this._color = color;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = this._color.rgba;
    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export { Ring, Circle };
