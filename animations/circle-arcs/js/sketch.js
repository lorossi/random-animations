import { Engine, Palette, XOR128, Color } from "./lib.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._zoom = 0.7;
    this._inner_scl = 0.9;
    this._line_width = 10;
    this._palette_hex = ["#C20E37", "#F48325", "#F4B213", "#2A999C", "#2a9c66"];
    this._bg = Color.fromHEX("#0D2C44");
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._rows = this._xor128.random_int(4, 8);
    this._cols = this._xor128.random_int(6, 10);

    this._circle_scl = this.width / Math.max(this._cols, this._rows);

    this._palette = Palette.fromHEXArray(this._palette_hex);

    document.body.style.background = this._bg.hex;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color: green");
    }
  }

  draw() {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    const phi = t * Math.PI * 2;

    this.background(this._bg);
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._zoom, this._zoom);
    this.ctx.translate(-this.width / 2, 0);

    this.ctx.translate(this._circle_scl / 2, 0);

    for (let j = 0; j < this._cols; j++) {
      const dx = (j / this._cols) * this.width;
      const gamma = (j / this._cols) * Math.PI;
      this.ctx.save();
      this.ctx.translate(dx, 0);
      this.ctx.scale(this._inner_scl, this._inner_scl);
      for (let i = 0; i < this._rows; i++) {
        const theta = ((i / this._rows) * Math.PI) / 2 - phi - gamma;
        const dy = (Math.sin(theta) * this.height) / 2;
        this.ctx.save();
        this.ctx.translate(0, dy);

        this.ctx.strokeStyle = this._palette.getColor(i);
        this.ctx.lineWidth = this._line_width;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this._circle_scl / 2, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }
      this.ctx.restore();
    }

    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
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
}

export { Sketch };
