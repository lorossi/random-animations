import { Color } from "./engine.js";

class Band {
  constructor(x, width, height) {
    this._x = x;
    this._width = width;
    this._height = height;

    this._heights = [];
  }

  setPalette(palette, saturation = 1) {
    this._palette = palette;
    this._saturation = saturation;
  }

  initDependencies(xor128) {
    this._xor128 = xor128;
  }

  generate() {
    const divisions = this._xor128.random_int(3, 5);
    this._heights = new Array(divisions)
      .fill(0)
      .map((_) => this._xor128.random_int(1, 10));
    const heights_sum = this._heights.reduce((a, b) => a + b, 0);
    this._heights = this._heights.map((h) => (h / heights_sum) * this._height);
    this._cumulative_heights = this._heights.map((_, i) =>
      i == 0 ? 0 : this._heights.slice(0, i).reduce((a, b) => a + b, 0)
    );
    this._colors = this._xor128.shuffle(this._palette).slice(0, divisions);
    this._rotated = this._xor128.random_bool();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x, 0);

    if (this._rotated) {
      ctx.translate(this._width / 2, this._height / 2);
      ctx.rotate(Math.PI);
      ctx.translate(-this._width / 2, -this._height / 2);
    }

    for (let i = 0; i < this._heights.length; i++) {
      ctx.save();
      ctx.translate(0, this._cumulative_heights[i]);

      ctx.fillStyle = this._colors[i].rgb;

      ctx.beginPath();
      ctx.rect(0, 0, this._width, this._heights[i]);
      ctx.arc(this._width / 2, 0, this._width / 2, Math.PI, 0);
      ctx.fill();

      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - this._saturation})`;
    //ctx.fillStyle = Color.fromHSL(0, this._saturation * 100, 0.25).rgba;
    ctx.fillRect(0, 0, this._width, this._height);
    ctx.restore();

    ctx.restore();
  }
}

export { Band };
