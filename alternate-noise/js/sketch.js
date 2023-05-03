class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._slices_num = 12;
    this._seeds_num = 4;
  }

  setup() {
    this._seed = Math.random() * 1e9;
    const random = new XOR128(this._seed);

    this._seeds = Array(this._seeds_num)
      .fill(0)
      .map(() => random.random(0, 1e9));

    this._slices = Array(this._seeds_num)
      .fill(0)
      .map((_, i) => {
        const x = (i / this._slices_num) * this.width;
        const w = this.width / this._slices_num;
        const h = this.height;
        const seed = this._seeds[i % this._seeds_num];
        return new Slice(x, 0, w, h, seed);
      });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }

    this.background("rgb(245, 245, 245)");
  }

  draw() {
    this._slices.forEach((s) => s.update());

    for (let i = 0; i < this._slices_num / this._seeds_num; i++) {
      this.ctx.save();
      const dx = (this.width / this._slices_num) * this._seeds_num * i;
      this.ctx.translate(dx, 0);

      this._slices.forEach((s) => {
        s.show(this.ctx);
      });

      this.ctx.restore();
    }

    if (this._slices.every((s) => s.ended)) {
      this.noLoop();
      console.log("End of sketch. Click to restart.");
      if (this._recording) {
        this.stopRecording();
        console.log("%cRecording stopped", "color:red");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }
    }
  }

  click() {
    if (this._recording) return;
    this.setup();
    this.loop();
  }
}
