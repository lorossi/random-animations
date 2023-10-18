import { Circle } from "./circle.js";

class Container {
  constructor(x, y, circles_num, size) {
    this._x = x;
    this._y = y;
    this._circles_num = circles_num;
    this._size = size;
  }

  setAttributes(
    container_scl,
    circles_scl,
    circles_bars_ratio,
    circles_bars_num
  ) {
    this._container_scl = container_scl;
    this._circles_scl = circles_scl;
    this._circles_bars_ratio = circles_bars_ratio;
    this._circles_bars_num = circles_bars_num;
  }

  initDependencies(xor128, noise, noise_scl, time_scl) {
    this._xor128 = xor128;
    this._noise = noise;
    this._noise_scl = noise_scl;
    this._time_scl = time_scl;
  }

  setColors(circles_color, outline_color) {
    this._circles_color = circles_color;
    this._outline_color = outline_color;
  }

  init() {
    const angle_delta =
      (Math.PI * 2) / this._circles_bars_num / this._circles_num;

    this._circles = new Array(this._circles_num).fill(null).map((_, i) => {
      const c = new Circle(
        this._size / 2,
        this._circles_bars_ratio,
        this._circles_bars_num
      );
      c.setAttributes(angle_delta * i, this._noise_scl, this._time_scl);
      c.setColors(this._circles_color, this._outline_color);
      c.initDependencies(this._xor128, this._noise);
      return c;
    });
  }

  update(t) {
    this._circles.forEach((c) => c.update(t));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._container_scl, this._container_scl);
    this._circles.forEach((c) => c.draw(ctx));
    ctx.restore();
  }
}

export { Container };
