class Sketch extends Engine {
  preload() {
    this._bars_num = 50;
    this._duration = 600;
    this._recording = false;
  }

  setup() {
    const scl = this.width / this._bars_num;
    this._bars = Array(this._bars_num)
      .fill(null)
      .map((_, i) => {
        const seed = (i / this._bars_num) * Math.PI * 12;
        return new Bar(scl * i, scl, this.height, seed);
      });
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;
    const theta = t * Math.PI * 2;

    this._bars.forEach((b) => {
      b.move(theta);
      b.show(this.ctx);
    });

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
