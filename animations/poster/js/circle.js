import { Band } from "./band.js";
import { Color } from "./lib.js";
class Circle {
  constructor(x, y, r, bands_scl) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._bands_scl = bands_scl;
  }

  initDependencies(xor128) {
    this._xor128 = xor128;
  }

  setPalette(palette) {
    this._palette = palette;
  }

  generate() {
    this._bands_num = this._xor128.random_int(7, 10);
    this._bands = new Array(this._bands_num).fill(0).map((_, i) => {
      const x = i * this._bands_scl;
      const height = this._r * 2;
      const b = new Band(x, this._bands_scl, height);
      b.setPalette(this._palette);
      b.initDependencies(this._xor128);
      return b;
    });
    this._rotation = this._xor128.pick([Math.PI / 4, -Math.PI / 4]);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.rotate(this._rotation);
    ctx.strokeStyle = Color.fromMonochrome(245).rgb;
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.arc(0, 0, this._r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.clip();

    ctx.rotate(Math.PI / 2);
    ctx.translate(-this._r, -this._r);
    this._bands.forEach((b) => {
      b.generate();
      b.draw(ctx);
    });

    ctx.restore();
  }
}

export { Circle };
