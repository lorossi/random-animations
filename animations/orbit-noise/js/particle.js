class Particle {
  constructor(rho, phi, noise, xor128) {
    this._rho = rho;
    this._phi = phi;

    this._noise = noise;
    this._xor128 = xor128;

    this._d_rho = 0;
    this._d_phi = 0;
    this._a = 0;

    this._seed = this._xor128.random(1e9);
    this._r = 2;
    this._noise_scl = 1;
  }

  update(t) {
    const time_theta = t * Math.PI * 2;
    const a = Math.abs(Math.cos(time_theta + this._phi)) ** 2;

    const nx = this._noise_scl * Math.cos(time_theta);
    const ny = this._noise_scl * Math.sin(time_theta);

    const n1 = this._noise.noise(nx, ny, this._phi, this._seed);
    const n2 = this._noise.noise(nx, ny, this._rho, this._seed);

    this._d_rho = (-a * (((n1 + 1) / 2) * this._rho)) / 2;
    this._d_phi = (((n2 + 1) / 2) * Math.PI) / 2;

    this._a = this._polyEaseInOut((n1 + 1) / 2, 4);
  }

  show(ctx) {
    const fill = `rgba(255, 255, 255, ${this._a})`;

    ctx.save();
    ctx.rotate(this._phi);
    ctx.translate(this._rho, 0);
    ctx.rotate(this._d_phi);
    ctx.translate(this._d_rho, 0);

    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, this._r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _polyEaseInOut(x, n = 2) {
    return x < 0.5
      ? Math.pow(2, n - 1) * Math.pow(x, n)
      : 1 - Math.pow(-2 * x + 2, n) / 2;
  }
}

export { Particle };
