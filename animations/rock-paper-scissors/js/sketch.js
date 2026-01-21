import { Engine, XOR128, PaletteFactory, Palette } from "./lib.js";
import { ParticleFactory } from "./particle.js";

class Sketch extends Engine {
  preload() {
    this._cols = 100;
    this._hex_palettes = [
      ["#0077b6", "#00b4d8", "#90e0ef"],
      ["#007f5f", "#aacc00", "#ffff3f"],
      ["#04b2d9", "#27296d", "#da4167"],
      ["#02205f", "#ffcb05", "#5595b2"],
      ["#5f0f40", "#9a031e", "#fb8b24"],
      ["#390099", "#9e0059", "#ff0054"],
    ];
    this._emojis = ["🪨", "📄", "✂️"];
    this._emoji_update_freq = 60;

    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    this._start_score = this._xor128.random_int(1, 4);

    this._particle_scl = this.width / this._cols;
    this._map = new Array(this._cols ** 2).fill(0).map(() => {
      const t = this._xor128.random_int(0, 3);
      return ParticleFactory.fromIndex(t, this._palette, this._start_score);
    });

    this._bg = this._palette.getRandomColor(this._xor128);
    document.body.style.background = this._bg.rgb;

    this._frame_offset = this.frameCount;

    this._ended = false;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (this._ended) return;

    const delta_frame = this.frameCount - this._frame_offset;
    if (delta_frame % this._emoji_update_freq === 0) {
      const emoji =
        this._emojis[
          (delta_frame / this._emoji_update_freq) % this._emojis.length
        ];
      this._setFavicon(emoji);
    }

    this.ctx.save();
    this.background(this._bg);

    // fight
    this._map.forEach((p, i) => {
      const [x, y] = this._1d_to_2d(i);
      const neighbors = this._getNeighbors(x, y);

      this.ctx.save();
      this.ctx.translate(x * this._particle_scl, y * this._particle_scl);
      this.ctx.scale(this._particle_scl, this._particle_scl);
      p.draw(this.ctx);
      this.ctx.restore();

      neighbors.forEach(([_, q]) => p.fight(q));
    });

    // replace dead particles
    let anything_changed = false;
    this._map.forEach((p, i) => {
      if (p.getToReplace()) {
        const replacement_type = p.getReplacementType();
        this._map[i] = ParticleFactory.fromIndex(
          replacement_type,
          this._palette,
          this._start_score,
        );
        anything_changed = true;
      }
    });

    this.ctx.restore();

    if (!anything_changed) this._ended = true;

    if (this._ended && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
  }

  _getNeighbors(x, y) {
    let neighbors = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        let nx = x + dx;
        let ny = y + dy;
        // wrap around
        if (nx < 0) nx = this._cols - 1;
        if (nx >= this._cols) nx = 0;
        if (ny < 0) ny = this._cols - 1;
        if (ny >= this._cols) ny = 0;

        const i = this._2d_to_1d(nx, ny);
        neighbors.push([i, this._map[i]]);
      }
    }

    return neighbors;
  }

  _1d_to_2d(i) {
    return [i % this._cols, Math.floor(i / this._cols)];
  }

  _2d_to_1d(x, y) {
    return y * this._cols + x;
  }

  _setFavicon(emoji) {
    const favicon = document.querySelector("link[rel='icon']");
    const text = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
    favicon.setAttribute("href", text);
  }
}

export { Sketch };
