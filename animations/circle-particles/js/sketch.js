import { Engine, XOR128, Color } from "./lib.js";

class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = false;

    this._particles_num = 100000;
    this._circles = 6;
    this._particle_scl = 1;
    this._scl = 0.9;
    this._palette = [Color.fromMonochrome(15), Color.fromMonochrome(240)];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    [this._fg, this._bg] = this._xor128.shuffle(this._palette);
    this._theta = this._xor128.random(Math.PI * 2);
    this._dir = this._xor128.pick([-1, 1]);

    document.body.style.backgroundColor = this._bg.rgba;
    this._frame_started = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_started;
    const t = (delta_frame / this._duration) % 1;

    const theta = Math.PI / this._circles + this._theta;
    const circle_scl = this.width / 2 / this._circles;

    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.rotate(theta);

    for (let j = this._circles; j > 0; j--) {
      const outer_r = ((j / (this._circles + 1)) * this.width) / 2 + circle_scl;
      const inner_r = outer_r - circle_scl;
      const dir = j % 2 == 0 ? -1 : 1;

      this.ctx.save();
      this.ctx.lineWidth = this._line_width;
      this.ctx.fillStyle = this._bg.rgba;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, outer_r, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = this._fg.rgba;

      for (let i = 0; i < this._particles_num; i++) {
        const phi = (j / this._circles) * Math.PI * 2;
        const gamma = t * this._dir * dir * Math.PI * 2;

        const rho = this._xor128.random(inner_r, outer_r);
        const theta =
          this._polyEaseOut(this._xor128.random()) * Math.PI * 2 + phi + gamma;

        const x = rho * Math.cos(theta);
        const y = rho * Math.sin(theta);

        this.ctx.beginPath();
        this.ctx.arc(x, y, this._particle_scl, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    this.ctx.fillStyle = this._bg.rgba;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, circle_scl, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    if (this._recording && t == 0 && delta_frame > 0) {
      console.log("%cRecording stopped", "color: red");
      this.stopRecording();
      this.saveRecording();
      this.noLoop();
      console.log("%cRecording saved!", "color: green");
    }
  }

  click() {
    this.setup();
  }

  _polyEaseOut(x, n = 10) {
    return 1 - Math.pow(1 - x, n);
  }
}

export { Sketch };
