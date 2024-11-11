import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Sine } from "./sines.js";

class Sketch extends Engine {
  preload() {
    this._sin_spacing = 0.8;
    this._scl = 0.8;
    this._duration = 300;

    this._noise_scl = 0.025;
    this._noise_color_scl = 0.001;
    this._noise_time_scl = 0.5;

    this._texture_scl = 2;
    this._texture_oversampling = 2;

    this._background_color = new Color(246, 238, 227);
    this._max_sines_ch = 25;
    this._lines = "WHAT DOES ANYTHING EVEN MEAN TO YOU?".split(" ");
  }

  setup() {
    const seed = new Date().getTime();
    const sin_num = this._lines.length;

    this._sin_width = this.width / sin_num;

    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128);
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
        t
      );
      s.init();
      return s;
    });

    this._max_nodes = this._sines.reduce(
      (acc, sine) => (sine.nodes_num > acc ? sine.nodes_num : acc),
      0
    );

    this._texture = this._createTexture();
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._background_color.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._sines.forEach((sine) => {
      sine.update(t);
      sine.draw(this.ctx);
    });

    this.ctx.restore();

    this._applyTexture();
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
      (this._texture_oversampling - 1) * this.width
    );
    const dy = -this._xor128.random(
      (this._texture_oversampling - 1) * this.height
    );

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(
      this._texture,
      dx,
      dy,
      this.width * this._texture_oversampling,
      this.height * this._texture_oversampling
    );
    this.ctx.restore();
  }
}

export { Sketch };
