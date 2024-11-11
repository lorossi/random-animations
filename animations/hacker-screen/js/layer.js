class Layer {
  constructor() {
    this.theta = 0;
    this.phi = 0;
    this.characters_map = " .:-=+*#%@".split("");
  }

  update(t) {
    this.theta = -Math.PI * 2 * t * this._omega + this.phi;
  }

  show(ctx) {}

  setupCtx(ctx, scl = 16) {
    ctx.translate(this._x, this._y);

    ctx.translate(this._size / 2, this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.strokeStyle = this._fg_color.rgba;
    ctx.lineWidth = 2;
    ctx.strokeRect(-this._size / 2, -this._size / 2, this._size, this._size);

    ctx.scale(0.98, 0.98);

    ctx.translate(-this._size / 2, -this._size / 2);

    // clip the canvas
    ctx.beginPath();
    ctx.rect(0, 0, this._size, this._size);
    ctx.clip();

    ctx.fillStyle = this._fg_color.rgba;
    ctx.font = `${scl}px Hack-Bold`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }

  wrapTheta(t) {
    return this.wrap(t, -Math.PI, Math.PI);
  }

  easeInPoly(t, exp = 2) {
    const tt = Math.max(0, Math.min(1, t));
    return Math.pow(tt, exp);
  }

  easeOutPoly(t, exp = 2) {
    const tt = Math.max(0, Math.min(1, t));
    return 1 - Math.pow(1 - tt, exp);
  }

  remap(x, old_min, old_max, new_min, new_max) {
    return (
      ((x - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min
    );
  }

  wrap(x, min, max) {
    const range = max - min;
    while (x < min) x += range;
    while (x >= max) x -= range;
    return x;
  }
}

export { Layer };
