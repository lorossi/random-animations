import { Engine, XOR128, Color } from "./lib.js";

class Sketch extends Engine {
  preload() {
    this._cols = 500;
    this._rows = 500;
    this._scl = 0.8;

    this._bg = Color.fromMonochrome(245);
    this._black = Color.fromMonochrome(15);

    this._line = "NOTHING SMART TO SAY";
    this._duration = 120;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._rect_scl = Math.min(
      this.width / this._cols,
      this.height / this._rows,
    );

    document.body.style.backgroundColor = this._bg.rgb;

    this._frame_offset = this.frameCount;
  }

  draw() {
    const delta_frames = this.frameCount - this._frame_offset;
    const t = (delta_frames / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgb);
    this.scaleFromCenter(this._scl);

    this.ctx.fillStyle = this._black.rgb;
    this.ctx.fillRect(this._dx, 0, this._width - 2 * this._dx, this._height);

    // maximum distance, manhattan distance
    const max_dist = (this._cols / 2 + this._rows / 2) * Math.SQRT2;

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._rows; y++) {
        // manhattan distance
        const dist =
          (Math.abs(x - this._cols / 2) + Math.abs(y - this._rows / 2)) /
          max_dist;
        const eased_dist = this._easeTrig(dist - t);

        if (this._xor128.random() > eased_dist) continue;

        const n = this._polyEase(this._xor128.random());
        const m = Math.floor(40 * (n + 1)) / 2;
        const c = Color.fromMonochrome(m);

        this.ctx.fillStyle = c.rgb;

        this.ctx.beginPath();
        this.ctx.rect(
          x * this._rect_scl,
          y * this._rect_scl,
          this._rect_scl,
          this._rect_scl,
        );
        this.ctx.fill();
        this.ctx.stroke();
      }
    }

    this.ctx.restore();

    this.ctx.save();
    const dx = Math.floor(((1 - this._scl) * this.width) / 2);
    const font_size = Math.floor(dx / 2);

    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = this._black.rgb;
    this.ctx.font = `${font_size}px Helvetica`;

    for (let i = 0; i < 4; i++) {
      this.ctx.save();
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.rotate((Math.PI / 2) * i);
      this.ctx.translate(-this.width / 2 + dx / 4, -this.height / 2 + dx / 4);
      this.ctx.fillText(this._line, 0, 0);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  _easeTrig(t, n = 4, T = 3) {
    return Math.abs(Math.cos(t * Math.PI * T * 2)) ** n;
  }

  _polyEase(t, n = 4) {
    return t ** n;
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
