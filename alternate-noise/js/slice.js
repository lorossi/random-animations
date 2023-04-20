class Slice {
  constructor(x, y, w, h, noise_seed) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;

    this._random = new XOR128(noise_seed);
    this._bias = this._random.random(0, Math.PI * 2);

    this._particles = Array(200)
      .fill(0)
      .map(() => {
        const random_seed = this._random.random(0, 1e9);
        return new Particle(w, h, noise_seed, random_seed, this._bias);
      });
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    this._particles.forEach((p) => p.show(ctx));
    ctx.restore();
  }

  update(time) {
    this._particles.forEach((p) => p.move(time));
    this._particles = this._particles.filter((p) => !p.dead);
  }

  get ended() {
    return this._particles.length == 0;
  }
}
