import { Point, Utils } from "./lib.js";

class Trail {
  constructor(
    length,
    speed,
    noise_scl,
    seed,
    start_position,
    canvas_size,
    xor128,
    noise,
  ) {
    this._length = length;
    this._speed = speed;
    this._noise_scl = noise_scl;
    this._seed = seed;
    this._start_position = start_position.copy();
    this._canvas_size = canvas_size.copy();
    this._xor128 = xor128;
    this._noise = noise;

    this._history = [this._start_position];
    this._rotation = 0;
    this._flip = new Point(1, 1);

    this._img = new Image();
    this._img.src = "./assets/pointer.png";
    this._loaded = false;
    this._img.addEventListener("load", () => (this._loaded = true));
  }

  add(point) {
    this._history.push(point);
    if (this._history.length > this._length) this._history.shift();
  }

  shift() {
    this._history.shift();
  }

  update(dt, t) {
    if (!this._loaded) return;
    if (this._history.length === 0) return;

    const last_point = this._history[this._history.length - 1];
    const n = this._noise.noise(
      last_point.x * this._noise_scl,
      last_point.y * this._noise_scl,
      t,
      this._seed,
    );
    const theta = n * 2 * Math.PI;
    let x = last_point.x + Math.cos(theta) * this._speed * dt;
    let y = last_point.y + Math.sin(theta) * this._speed * dt;

    // Wrap around the canvas
    x = Utils.wrap(x, 0, this._canvas_size.x);
    y = Utils.wrap(y, 0, this._canvas_size.y);

    this.add(new Point(x, y));
  }

  draw(ctx) {
    ctx.save();
    this._history.forEach((point, i) => {
      const j = (i + 1) / this._history.length; // Older points are more transparent
      const alpha = Utils.ease_in_exp(j);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(...point.toArray());
      ctx.rotate(this._rotation);
      ctx.scale(this._flip.x, this._flip.y);
      ctx.drawImage(this._img, 0, 0, 32, 32);
      ctx.restore();
    });
    ctx.restore();
  }
}

export { Trail };
