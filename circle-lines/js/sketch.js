import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._cols = 12;
    this._scl = 0.9;
    this._circle_scl = 0.8;
    this._texture_scl = 100;
  }

  setup() {
    const seed = Date.now();
    this._xor128 = new XOR128(seed);

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    this.noLoop();

    const t = (this.frameCount / this._duration) % 1;
    const scl = Math.min(this.width, this.height) / this._cols;

    this.ctx.save();
    this.background("red");

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2 + scl / 2, -this.height / 2 + scl / 2);

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const dist = (x ** 2 + y ** 2) ** 0.5 / ((this._cols * Math.SQRT2) / 2);
        const n = this._polyEaseIn(dist, 2);
        const lines = Math.floor(n * 15);

        this.ctx.save();
        this.ctx.translate(x * scl, y * scl);
        this.ctx.scale(this._circle_scl, this._circle_scl);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgb(15, 15, 15)";
        this.ctx.beginPath();

        for (let i = 0; i < lines; i++) {
          const theta_1 = this._xor128.random(Math.PI * 2);
          const theta_2 = this._xor128.random(Math.PI * 2);

          const x1 = (scl / 2) * Math.cos(theta_1);
          const y1 = (scl / 2) * Math.sin(theta_1);
          const x2 = (scl / 2) * Math.cos(theta_2);
          const y2 = (scl / 2) * Math.sin(theta_2);

          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }
    }

    this.ctx.restore();

    this.ctx.save();
    // add texture
    this.ctx.globalCompositeOperation = "darker";

    for (let i = 0; i < 250; i++) {
      const x = this._xor128.random_int(this.width);
      const y = this._xor128.random_int(this.height);
      const ch = this._xor128.random_int(25);
      const a = this._xor128.random(2, 50);
      const b = this._xor128.random(2, 50);
      const rot = this._xor128.random(Math.PI * 2);

      this.ctx.fillStyle = `rgba(${ch}, ${ch}, ${ch}, 0.05)`;
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, a, b, rot, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _polyEaseIn(x, n = 2) {
    return Math.pow(x, n);
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
