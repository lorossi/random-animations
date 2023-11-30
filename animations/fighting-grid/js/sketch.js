import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { GridPoint, GridGroup } from "./grid.js";
import { PaletteFactory } from "./palette-factory.js";

class Sketch extends Engine {
  preload() {
    this._points_dist = 15;
    this._bg = Color.fromMonochrome(245);

    this._scl = 0.95;
    this._noise_scl = 0.01;
    this._texture_scl = 1;
    this._texture_size = 3;
    this._super_sampling = 10;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._palette = PaletteFactory.getRandomPalette(this._xor128)
      .colors.map((c) => ({ color: c, sort: this._xor128.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((c) => c.color)
      .slice(0, 4);

    // init points
    const cols = Math.floor(this.width / this._points_dist);
    this._points = new Array(cols * cols).fill(null).map((_, i) => {
      const x = (i % cols) * this._points_dist;
      const y = Math.floor(i / cols) * this._points_dist;

      const dx =
        this._noise.noise(x * this._noise_scl, y * this._noise_scl, seed, 0) *
        0.5 *
        this._points_dist;
      const dy =
        this._noise.noise(x * this._noise_scl, y * this._noise_scl, 0, seed) *
        0.5 *
        this._points_dist;

      return new GridPoint(x + dx, y + dy, this._points_r);
    });
    // assign the neighbors to each point
    this._points.forEach((point, i) => {
      const neighbors = [];
      if (i % cols !== 0) neighbors.push(this._points[i - 1]); // left
      if (i % cols !== cols - 1) neighbors.push(this._points[i + 1]); // right
      if (i >= cols) neighbors.push(this._points[i - cols]); // top
      if (i < this._points.length - cols)
        // bottom
        neighbors.push(this._points[i + cols]);

      point.addNeighbors(neighbors);
    });

    // init starting points randomly
    this._starting_points = this._xor128.shuffle(this._points).slice(0, 4);
    // init groups
    this._groups = new Array(this._palette.length)
      .fill(null)
      .map((_, i) => new GridGroup(this._starting_points[i], this._palette[i]));
    // create weights for each group
    const weights = new Array(this._palette.length)
      .fill(0)
      .map((_) => this._xor128.random(0.1, 0.5));
    const weights_sum = weights.reduce((a, b) => a + b, 0);
    // normalize, calculate cumulative sum, and reverse weights
    this._weights = new Array(this._groups.length).fill(0);
    for (let i = 1; i < this._groups.length; i++) {
      this._weights[i] = weights[i] / weights_sum + this._weights[i - 1];
    }
    this._weights.reverse();

    // init noise texture
    this._noise_texture = this._createTexture();

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (this._points.every((point) => point.picked)) {
      if (this._recording) {
        this.stopRecording();
        console.log("%cRecording stopped", "color:red");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
        this._recording;
      }

      return;
    }

    this.ctx.save();

    this.background(this._bg.rgb);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this.ctx.translate(this._points_dist / 2, this._points_dist / 2);

    for (let i = 0; i < this._super_sampling; i++) {
      const r = this._xor128.random();
      let group = null;
      for (let j = 0; j < this._weights.length; j++) {
        if (r > this._weights[j]) {
          group = this._groups[j];
          break;
        }
      }

      const neighbors = group.availableNeighbors();
      if (neighbors.length > 0) group.grow(this._xor128.pick(neighbors));
    }

    this._groups.forEach((group) => {
      group.show(this.ctx);
    });
    this.ctx.restore();

    this.ctx.save();
    // draw noise texture
    this.ctx.globalCompositeOperation = "darker";
    this.ctx.drawImage(this._noise_texture, 0, 0);
    this.ctx.restore();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);

    for (let x = 0; x < this.width; x += this._texture_size) {
      for (let y = 0; y < this.height; y += this._texture_size) {
        const n = this._xor128.random(255);
        const c = Color.fromMonochrome(n, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_size, this._texture_size);
      }
    }

    return canvas;
  }

  click() {
    this.setup();
  }
}

export { Sketch };
