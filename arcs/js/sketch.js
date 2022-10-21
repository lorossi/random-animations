class Sketch extends Engine {
  preload() {
    this._num = 4;
    this._zoom = 0.9;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    this._noise = new SimplexNoise();
    this._random = new XOR128();

    this._scl = this.width / this._num;
    this._shapes = Array(this._num * this._num)
      .fill(null)
      .map(
        (s, i) =>
          new Shape(
            i % this._num,
            Math.floor(i / this._num),
            this._scl,
            this._noise,
            this._random
          )
      );
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const theta = t * Math.PI * 2;
    const tx = Math.cos(theta) * 0.5 + 0.5;
    const ty = Math.sin(theta) * 0.5 + 0.5;

    this.ctx.save();
    this.background("rgb(240, 240, 240)");
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._zoom, this._zoom);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.translate(this._scl / 2, this._scl / 2);
    this._shapes.forEach((s) => {
      s.move(tx, ty);
      s.show(this.ctx);
    });
    this.ctx.restore();

    if (this._recording) {
      if (t == 0 && this.frameCount == 0) {
        this.startRecording();
        console.log("%cRecording started", "color: green");
      } else if (this.frameCount == this._duration) {
        console.log("%cRecording stopped", "color: red");
        this.stopRecording();
        this.saveRecording();
        this.noLoop();
        console.log("%cRecording saved!", "color: green");
      }
    }
  }
}
