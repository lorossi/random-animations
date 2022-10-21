class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = true;

    this._max_iters = 100000;
    this._circles = 6;
    this._particle_scl = 1;
    this._scl = 0.9;
    this._palette = ["rgb(240, 240, 240)", "rgb(15, 15, 15)"];
  }

  setup() {
    this._random = new XOR128();
    this._seed = this._random.random(0, Math.PI * 2);
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    const theta = Math.PI / this._circles;
    const circle_scl = this.width / 2 / this._circles;

    this.ctx.save();
    this.background(this._palette[0]);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.rotate(theta + this._seed);

    for (let j = this._circles; j > 0; j--) {
      const outer_r = ((j / (this._circles + 1)) * this.width) / 2 + circle_scl;
      const inner_r = outer_r - circle_scl;
      const dir = j % 2 == 0 ? -1 : 1;

      this.ctx.save();
      this.ctx.strokeStyle = this._line_color;
      this.ctx.lineWidth = this._palette[0];
      this.ctx.fillStyle = this._palette[1];
      this.ctx.beginPath();
      this.ctx.arc(0, 0, outer_r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = this._palette[0];
      this.ctx.strokeStyle = this._palette[1];

      for (let i = 0; i < this._max_iters; i++) {
        const phi = (j / this._circles) * Math.PI * 2;
        const gamma = t * dir * Math.PI * 2;

        const rho = this._random.random(inner_r, outer_r);
        const theta =
          this._polyEaseOut(this._random.random()) * Math.PI * 2 + phi + gamma;

        const x = rho * Math.cos(theta);
        const y = rho * Math.sin(theta);

        this.ctx.beginPath();
        this.ctx.arc(x, y, this._particle_scl, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    this.ctx.fillStyle = this._palette[0];
    this.ctx.beginPath();
    this.ctx.arc(0, 0, circle_scl, 0, Math.PI * 2);
    this.ctx.fill();

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

    if (!this._recording) noLoop();
  }

  click() {
    if (!this._recording) loop();
  }

  _polyEaseOut(x, n = 10) {
    return 1 - Math.pow(1 - x, n);
  }
}
