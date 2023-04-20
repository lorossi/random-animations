class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;
  }

  setup() {
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this._frameCount / this._duration) % 1;

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }
}
