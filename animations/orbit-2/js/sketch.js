import { Engine, SimplexNoise, XOR128, Color } from "./enlibgine.js";
import { Frame } from "./frame.js";

class Sketch extends Engine {
  preload() {
    this._particles_num = 500;
    this._cols = 2;
    this._seed_scl = 5;
    this._scl = 0.9;
    this._frame_scl = 0.85;

    this._frame_offset = 0;
    this._duration = 300;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._seed);
    this._noise_scl = this._xor128.random(0.1, 1);

    this._frames = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const size = this.width / this._cols;
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const f = new Frame(x, y, size);
      f.setDependencies(this._xor128, this._noise);
      f.setAttributes(
        this._seed_scl,
        this._noise_scl,
        this._particles_num,
        this._frame_scl,
        this._steps_per_frame,
      );
      f.generateParticles();
      return f;
    });

    this._bg = Color.fromMonochrome(15);
    this._fg = Color.fromMonochrome(245, 0.15);

    this.background(this._bg.rgb);

    document.body.style.backgroundColor = this._bg.rgb;

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const delta_frames = this.frameCount - this._frame_offset;
    const t = (delta_frames / this._duration) % 1;

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.strokeStyle = this._fg.rgba;

    this._frames.forEach((f) => {
      f.move(t);
      f.show(this.ctx);
    });
    this.ctx.restore();

    if (t == 0 && delta_frames > 0) {
      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }
      this.noLoop();
    }
  }

  click() {
    this.setup();
    this.loop();
    this.draw();
  }
}

export { Sketch };
