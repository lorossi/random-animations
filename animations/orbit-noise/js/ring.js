import { Particle } from "./particle.js";

class Ring {
  constructor(particle_count, inner_r, outer_r, noise, xor128) {
    this._particle_count = particle_count;
    this._inner_r = inner_r;
    this._outer_r = outer_r;
    this._noise = noise;
    this._xor128 = xor128;

    this._initial_phase = this._xor128.random(Math.PI * 2);
    this._speed = this._xor128.random_int(1, 5);
    this._direction = this._xor128.random_bool() ? 1 : -1;

    console.log(this._speed);

    this._createParticles();
  }

  _createParticles() {
    this._particles = Array(this._particle_count)
      .fill()
      .map(() => {
        const rho = this._xor128.random(this._inner_r, this._outer_r);
        const phi = this._xor128.random(Math.PI * 2);

        return new Particle(rho, phi, this._noise, this._xor128);
      });
  }

  update(t) {
    this._particles.forEach((particle) => particle.update(t * this._speed));
  }

  show(ctx) {
    ctx.rotate(this._initial_phase);
    ctx.scale(this._direction, 1);
    this._particles.forEach((particle) => particle.show(ctx));
  }
}

export { Ring };
