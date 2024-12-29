import { XOR128 } from "./xor128.js";

class Text {
  constructor(size, container_size, seed, color) {
    this._size = size;
    this._container_size = container_size;
    this._seed = seed;
    this._color = color;

    this._xor128 = new XOR128(this._seed);

    this._text = "why bother";
    this._font = `${this._size}px Hack`;

    const text_metrics = this._computeTextMetrics();
    this._x = this._xor128.random(
      text_metrics.width / 2,
      this._container_size - text_metrics.width / 2
    );
    this._y = this._xor128.random(
      text_metrics.height / 2,
      this._container_size - text_metrics.height / 2
    );
    this._rotation = this._xor128.random_interval(0, 0.05) * Math.PI;
  }

  _computeTextMetrics() {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = this._font;
    const metrics = ctx.measureText(this._text);
    return {
      width: metrics.width,
      height:
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this._color.rgba;
    ctx.font = this._font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(this._x, this._y);
    ctx.rotate(this._rotation);
    ctx.fillText(this._text, 0, 0);
    ctx.restore();
  }
}

export { Text };
