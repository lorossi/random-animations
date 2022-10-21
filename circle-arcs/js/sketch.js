class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._circles = 5;
    this._cols = 7;
    this._zoom = 0.7;
    this._inner_scl = 0.9;
    this._line_width = 10;
    this._palette = ["#C20E37", "#F48325", "#F4B213", "#2A999C", "#2a9c66"];
    this._background = "#0D2C44";
  }

  setup() {}

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const phi = t * Math.PI * 2;
    const scl = this.width / Math.max(this._cols, this._circles);

    this.background(this._background);
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._zoom, this._zoom);
    this.ctx.translate(-this.width / 2, 0);

    this.ctx.translate(scl / 2, 0);

    for (let j = 0; j < this._cols; j++) {
      const dx = (j / this._cols) * this.width;
      const gamma = (j / this._cols) * Math.PI;
      this.ctx.save();
      this.ctx.translate(dx, 0);
      this.ctx.scale(this._inner_scl, this._inner_scl);
      for (let i = 0; i < this._circles; i++) {
        const theta = ((i / this._circles) * Math.PI) / 2 - phi - gamma;
        const dy = (Math.sin(theta) * this.height) / 2;
        this.ctx.save();
        this.ctx.translate(0, dy);

        this.ctx.strokeStyle = this._palette[i % this._palette.length];
        this.ctx.lineWidth = this._line_width;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, scl / 2, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }
      this.ctx.restore();
    }

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
