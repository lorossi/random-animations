import { Engine, XOR128, SimplexNoise, Point, Color } from "./lib.js";
import { Sine } from "./sines.js";

class Sketch extends Engine {
  preload() {
    this._sin_spacing = 0.8;
    this._scl = 0.8;

    this._noise_scl = 0.025;
    this._noise_color_scl = 0.001;
    this._noise_time_scl = 0.5;

    this._texture_scl = 3;
    this._texture_oversampling = 1.05;

    this._bg = new Color(246, 238, 227);
    this._max_sines_ch = 25;
    this._lines = "WHAT DOES ANYTHING EVEN MEAN TO YOU".split(" ");
    this._font = "Recoleta";

    this._duration = 300;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    const sin_num = this._lines.length;

    this._sin_width = this.width / sin_num;

    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));
    this._noise.setDetail(3, 0.25);

    this._sin_pos = new Point(0, 0);
    const w = this._sin_width * this._sin_spacing;
    this._sines = new Array(sin_num).fill(0).map((_, i) => {
      const x = this._sin_width * i + this._sin_width / 2;
      const y = 0;
      const s = new Sine(x, y, w, this.height);
      const t = i < this._lines.length ? this._lines[i] : "";
      s.initDependencies(this._noise, this._xor128);
      s.setAttributes(
        this._max_sines_ch,
        this._noise_scl,
        this._noise_color_scl,
        this._noise_time_scl,
        t,
      );
      s.init();
      return s;
    });

    this._max_nodes = this._sines.reduce(
      (acc, sine) => (sine.nodes_num > acc ? sine.nodes_num : acc),
      0,
    );

    this._texture = this._createTexture();

    document.body.style.background = this._bg.rgba;

    this._font_loaded = false;
    document.fonts
      .load(`16px ${this._font}`)
      .then(() => (this._font_loaded = true));

    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (!this._font_loaded) {
      this._frame_offset = this.frameCount;
      return;
    }

    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg.rgb);
    this.scaleFromCenter(this._scl);

    this._sines.forEach((sine) => {
      sine.update(t);
      sine.draw(this.ctx);
    });

    this.ctx.restore();

    this._applyTexture();

    if (this._recording && t == 0 && delta_frame > 0) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
    this.draw();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this._texture_oversampling * this.width;
    canvas.height = this._texture_oversampling * this.height;
    const ctx = canvas.getContext("2d");

    for (
      let x = 0;
      x < this.width * this._texture_oversampling;
      x += this._texture_scl
    ) {
      for (
        let y = 0;
        y < this.height * this._texture_oversampling;
        y += this._texture_scl
      ) {
        const r = this._xor128.random(127);
        const c = Color.fromMonochrome(r, 0.075);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  _applyTexture() {
    const dx = -this._xor128.random(
      (this._texture_oversampling - 1) * this.width,
    );
    const dy = -this._xor128.random(
      (this._texture_oversampling - 1) * this.height,
    );

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(
      this._texture,
      dx,
      dy,
      this.width * this._texture_oversampling,
      this.height * this._texture_oversampling,
    );
    this.ctx.restore();
  }
}

export { Sketch };
