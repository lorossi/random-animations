import { Color, Utils } from "./lib.js";

class Compass {
  constructor(x, y, size, scl, noise) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._noise = noise;

    this._handle_length = this._size / 2;
    this._handle_width = this._size / 7;
    this._quadrant_width = 2;

    this._max_speed = 0.0025;
    this._min_speed = 0.0005;

    this._rotation = 0;
    this._target = 0;
    this._tracking = false;

    this._red = Color.fromHEX("#C11629");
    this._blue = Color.fromHEX("#1A488C");
    this._black = Color.fromMonochrome(220);
  }

  update_mouse(mx, my) {
    if (!this._tracking) return;

    const dx = mx - this._x;
    const dy = my - this._y;
    this._target = Math.atan2(dy, dx);
  }

  update_time(tx, ty, noise_scl) {
    if (this._tracking) return;

    const n = this._noise.noise(
      tx,
      ty,
      this._x * noise_scl,
      this._y * noise_scl,
    );
    this._target = n * Math.PI * 2;
  }

  start_tracking() {
    this._tracking = true;
  }

  stop_tracking() {
    this._tracking = false;
    this._target = 0;
  }

  draw(ctx, dt) {
    const rotation_diff = Math.atan2(
      Math.sin(this._target - this._rotation),
      Math.cos(this._target - this._rotation),
    );
    const t = Utils.ease_out_exp(
      Utils.clamp(Math.abs(rotation_diff) / Math.PI, 0, 1),
    );
    const speed = this._min_speed + (this._max_speed - this._min_speed) * t;
    this._rotation += rotation_diff * speed * dt;

    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.scale(this._scl, this._scl);
    ctx.rotate(this._rotation);

    ctx.lineWidth = this._quadrant_width;
    ctx.strokeStyle = this._black.toString();

    // draw the circle
    ctx.beginPath();
    ctx.arc(0, 0, this._size / 2, 0, 2 * Math.PI);
    ctx.stroke();

    // draw the north arrow
    this._drawHandle(ctx, this._red);

    // draw the south arrow
    ctx.rotate(Math.PI);
    this._drawHandle(ctx, this._blue);

    ctx.restore();
  }

  _drawHandle(ctx, color) {
    ctx.beginPath();
    ctx.moveTo(0, -this._handle_width / 2);
    ctx.lineTo(0, this._handle_width / 2);
    ctx.lineTo(this._handle_length, 0);
    ctx.fillStyle = color.rgba;
    ctx.fill();
  }
}

export { Compass };
