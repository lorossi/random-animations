class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;
  }

  setup() {}

  draw() {
    const t = (this.frameCount / this._duration) % 1;

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
