class Sketch extends Engine {
  preload() {
    this._rects = 9; // number of rects
    this._rect_w_fact = 2; // ratio of rect height to width
    this._rect_angle = Math.PI / 6; // perspective angle
    this._scl = 0.6; // animation scale
    this._duration = 300; // duration of animation
    this._max_dy_fact = 0.2; // max displacement of rects
    this._recording = false;

    this._palette = {
      true: {
        background: "rgb(240, 240, 240)",
        stroke: "rgb(15, 15, 15)",
        fill: "rgb(127, 127, 127)",
      },
      false: {
        background: "rgb(15, 15, 15)",
        stroke: "rgb(240, 240, 240)",
        fill: "rgb(127, 127, 127)",
      },
    };
  }

  setup() {
    this._counter = 0;
    this._inverted = false;
  }

  draw() {
    const t = (this.frameCount % this._duration) / this._duration;

    const current_palette = this._palette[this._inverted];

    this.background(current_palette.background);

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.lineWidth = 4;

    const scl = this.width / this._rects; // rect height
    const w = scl * this._rect_w_fact; // rect width
    const s = Math.sin(this._rect_angle); // constant

    this.ctx.translate(0, this.height / 2 + (w * s) / 2);

    for (let i = this._rects - 1; i >= 0; i--) {
      let dy;

      if (Math.floor(t * this._rects) == i) {
        // fraction of time elapsed in the current rect
        const time_frac = ease((t * this._rects) % 1, 2);
        // time fraction of the current rect as an angle
        const time_theta = Math.PI * time_frac * 2;
        // direction of the current rect
        const dir = (i + this._counter) % 2 == 0 ? -1 : 1;
        // displacement of the current rect
        dy = dir * Math.sin(time_theta) * this._max_dy_fact * this.height;
      } else dy = 0;

      this.ctx.save();
      this.ctx.translate(scl * i, dy);

      this.ctx.beginPath();
      this.ctx.moveTo(0, -this.height / 2);
      this.ctx.lineTo(0, this.height / 2);
      this.ctx.lineTo(w, this.height / 2 - w * s);
      this.ctx.lineTo(w, -this.height / 2 - w * s);
      this.ctx.closePath();

      this.ctx.fillStyle = current_palette.fill;
      this.ctx.fill();
      this.ctx.strokeStyle = current_palette.stroke;
      this.ctx.stroke();

      this.ctx.restore();
    }

    this.ctx.restore();

    if (this._recording) {
      this.saveFrame();
    }

    if (t == 0) {
      this._inverted = !this._inverted;
      this._counter++;

      if (this.frameCount >= 2 * this._duration && this._recording) {
        this.noLoop();
        console.log("ENDED");
        this.stopRecording();
        this.saveRecording();
      }
    }
  }
}

// easing function
const ease = (x, n = 2) =>
  x < 0.5
    ? Math.pow(2, n - 1) * Math.pow(x, n)
    : 1 - Math.pow(-2 * x + 2, n) / 2;
