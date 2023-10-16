import { Engine, SimplexNoise, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Sketch extends Engine {
  preload() {
    this._cols = 12;
    this._scl = 0.9;
    this._circle_scl = 0.8;
    this._texture_scl = 4;
    this._noise_scl = 0.015;
    this._lines_num = 30;

    this._white = new Color(245, 245, 245);
    this._black = new Color(15, 15, 15);
    this._background_color = new Color(171, 100, 101);
  }

  setup() {
    const seed = Date.now();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(seed);
    this._title = this._xor128.shuffle(Math.floor(seed * 1000).toString(16));
  }

  draw() {
    this.noLoop();

    const scl = Math.min(this.width, this.height) / this._cols;

    this.ctx.save();
    this.background(this._background_color.rgba);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2 + scl / 2, -this.height / 2 + scl / 2);

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        if (y == 0 && x == 0) continue;
        if (y == this._cols - 1 && x == this._cols - 1) continue;

        const dist = (x + y) / (2 * (this._cols - 1.5));
        const lines = Math.floor(
          this._polyEaseInOut(dist, 4) * this._lines_num
        );

        this.ctx.save();
        this.ctx.translate(x * scl, y * scl);
        this.ctx.scale(this._circle_scl, this._circle_scl);
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this._lines_num; i++) {
          const theta_1 = this._xor128.random(Math.PI * 2);
          const theta_2 = this._xor128.random(Math.PI * 2);

          this.ctx.strokeStyle =
            i < lines ? this._black.rgba : this._white.rgba;

          const x1 = (scl / 2) * Math.cos(theta_1);
          const y1 = (scl / 2) * Math.sin(theta_1);
          const x2 = (scl / 2) * Math.cos(theta_2);
          const y2 = (scl / 2) * Math.sin(theta_2);

          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }
    }

    // fill the first and last circle
    this.ctx.fillStyle = this._white.rgba;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, (scl / 2) * this._circle_scl, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = this._black.rgba;
    this.ctx.beginPath();
    this.ctx.arc(
      (this._cols - 1) * scl,
      (this._cols - 1) * scl,
      (scl / 2) * this._circle_scl,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    this.ctx.restore();

    // add texture
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";

    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const n = this._noise.noise(x * this._noise_scl, y * this._noise_scl);
        const ch = this._polyEaseOut((n + 1) / 2) * 32;

        this.ctx.fillStyle = `rgba(${ch}, ${ch}, ${ch}, 0.1)`;
        this.ctx.beginPath();
        this.ctx.rect(x, y, this._texture_scl, this._texture_scl);
        this.ctx.fill();
      }
    }
    this.ctx.restore();
  }

  _polyEaseOut(x, n = 2) {
    return 1 - Math.pow(1 - x, n);
  }

  _polyEaseInOut(x, n = 2) {
    if (x < 0.5) return 0.5 * Math.pow(x * 2, n);
    else return 1 - 0.5 * Math.pow(2 - x * 2, n);
  }

  click() {
    this.setup();
    this.draw();
  }

  keyPress(_, code) {
    console.log(code);
    if (code === 13) {
      // enter
      this.saveFrame(this._title);
    }
  }
}

export { Sketch };
