import { Particle } from "./particle.js";

class Frame {
  constructor(x, y, size) {
    this._x = x;
    this._y = y;
    this._size = size;
  }

  setDependencies(xor128, noise) {
    this._xor128 = xor128;
    this._noise = noise;
  }

  setAttributes(seed_scl, noise_scl, particles_num, frame_scl) {
    this._seed_scl = seed_scl;
    this._noise_scl = noise_scl;
    this._particles_num = particles_num;
    this._frame_scl = frame_scl;
  }

  generateParticles() {
    this._frame_offset = this._xor128.random(1e9); // offset to differentiate between frames

    this._particles = new Array(this._particles_num).fill(0).map((_, i) => {
      // compute the seed for each particle
      const seed =
        (this._seed_scl * i) / this._particles_num + this._frame_offset;
      // normalize noise so that the scale does not affect it
      const normalised_noise = (this._noise_scl / 1000) * this._size;
      return new Particle(this._noise, seed, normalised_noise, this._size / 2);
    });
  }

  move(t) {
    this._particles.forEach((p) => p.move(t));
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._size * (this._x + 0.5), this._size * (this._y + 0.5));
    ctx.scale(this._frame_scl, this._frame_scl);
    this._particles.forEach((p) => p.show(ctx));
    ctx.restore();
  }
}

export { Frame };
