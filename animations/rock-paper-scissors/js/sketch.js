import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { ParticleFactory } from "./particle.js";
import { PaletteFactory } from "./palette.js";

class Sketch extends Engine {
  preload() {
    this._cols = 200;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette = PaletteFactory.getRandomPalette(this._xor128);
    this._start_score = this._xor128.random_int(1, 4);

    this._particle_scl = this.width / this._cols;
    this._map = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const t = this._xor128.random_int(0, 3);
      return ParticleFactory.fromIndex(t, this._palette, this._start_score);
    });

    this._ended = false;
  }

  draw() {
    this.ctx.save();
    this.background(0);

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

    if (this._ended) return;

    // replace dead particles
    let anything_changed = false;
    this._map.forEach((p, i) => {
      if (p.getToReplace()) {
        const replacement_type = p.getReplacementType();
        this._map[i] = ParticleFactory.fromIndex(
          replacement_type,
          this._palette,
          this._start_score
        );
        anything_changed = true;
      } else {
        p.resetScore();
      }
    });

    this.ctx.restore();

    if (!anything_changed) this._ended = true;
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
}

export { Sketch };
