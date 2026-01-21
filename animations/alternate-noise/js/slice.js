import { Particle } from "./particle.js";

class Slice {
  constructor(x, y, w, h) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
  }

  initDependencies(random, noise, particle_color, noise_scl) {
    this._random = random;
    this._noise = noise;

    this._particles = Array(250)
      .fill(0)
      .map(() => {
        const p = new Particle(this._w, this._h);

        p.initDependencies(
          this._random,
          this._noise,
          particle_color,
          noise_scl,
        );
        return p;
      });
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    this._particles.forEach((p) => p.show(ctx));
    ctx.restore();

    this._particles = this._particles.filter((p) => p.alive);
  }

  update() {
    this._particles.forEach((p) => p.move());
  }

  get ended() {
    return this._particles.length == 0;
  }
}

export { Slice };
