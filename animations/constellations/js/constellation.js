import { Color, Point } from "./engine.js";
import { Star } from "./star.js";

class Constellation {
  constructor(x, y, size, scl, stars_num, cols) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._scl = scl;
    this._stars_num = stars_num;
    this._cols = cols;

    // default values
    this._fg_color = Color.fromMonochrome(24);
    this._star_color = Color.fromCSS("red");
    this._line_color = Color.fromCSS("red");

    this._stars_r = 2;
    this._stars = null;
    this._noise = null;
    this._noise_scl = 0;
    this._seeds = [];
  }

  setNoise(noise, noise_scl, time_scl) {
    this._noise = noise;
    this._noise_scl = noise_scl;
    this._time_scl = time_scl;
  }

  setColors(fg_color, star_color, line_color) {
    this._fg_color = fg_color;
    this._star_color = star_color;
    this._line_color = line_color;
  }

  _createStars() {
    this._stars = new Array(this._stars_num).fill(0).map((_, i) => {
      const star = new Star(this._stars_r, this._size, this._cols);
      star.setStarColor(this._star_color);
      star.setLineColor(this._line_color);
      star.setNoise(this._noise);
      star.setSeed(this._seeds[i]);
      return star;
    });
  }

  setStarsSeeds(seeds) {
    this._seeds = seeds;
  }

  setStarsR(r) {
    this._stars_r = r;
  }

  update(t) {
    if (!this._stars) this._createStars();

    const theta = t * Math.PI * 2;
    const tx = (1 + Math.cos(theta)) * this._time_scl;
    const ty = (1 + Math.sin(theta)) * this._time_scl;
    const nx = this._x * this._noise_scl;
    const ny = this._y * this._noise_scl;

    this._stars.forEach((star, _) => {
      star.update(nx, ny, tx, ty);
    });
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x + this._size / 2, this._y + this._size / 2);
    ctx.scale(this._scl, this._scl);
    ctx.translate(-this._size / 2, -this._size / 2);
    ctx.strokeStyle = this._fg_color.rgba;
    ctx.strokeRect(0, 0, this._size, this._size);

    ctx.save();
    this._stars.forEach((star) => {
      star.show(ctx);
    });
    ctx.restore();

    ctx.restore();
  }
}

export { Constellation };
