const NOISE_SCL = 0.0005;

class Particle {
  constructor(w, h, noise_seed, random_seed, bias) {
    this._w = w;
    this._h = h;
    this._bias = bias;

    this._dead = false;

    this._random = new XOR128(random_seed);
    this._noise = new SimplexNoise(noise_seed);
    this._noise.octaves = 3;
    this._noise.falloff = 0.25;

    const x = 0;
    const y = this._random.random(0, h);

    this._acc = new Vector(0, 0);
    this._pos = new Vector(x, y);
    this._old_pos = new Vector(-1, -1);
    this._vel = new Vector(0, 0);
    this._max_speed = 3;

    this._max_life = this._h * Math.SQRT2;
    this._life = this._max_life;
  }

  move() {
    if (this._dead) return;

    let n;
    n = this._noise.noise(this._pos.x * NOISE_SCL, this._pos.y * NOISE_SCL, 0);
    const rho = n / 2 + 0.5;

    n = this._noise.noise(
      this._pos.x * NOISE_SCL,
      this._pos.y * NOISE_SCL,
      1e9
    );

    const theta = n * Math.PI * 2 + this._bias;

    this._vel = Vector.fromAngle2D(theta).setMag(rho);

    this._vel.add(this._acc);
    this._vel.limit(this._max_speed);
    this._pos.add(this._vel);

    this._life--;
    if (this._life <= 0) this._dead = true;

    this._old_pos = this._pos.copy();
  }

  show(ctx) {
    if (!this._moved) return;
    if (this._dead) return;

    const x = Math.floor(this._pos.x);
    const y = Math.floor(this._pos.y);
    const a = this._easeLife();

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _easeLife() {
    const x = this._life / this._max_life;
    const eased = 1 - Math.pow(1 - x, 3);
    return eased * 0.15;
  }

  get _moved() {
    const dx = Math.floor(this._pos.x - this._old_pos.x);
    const dy = Math.floor(this._pos.y - this._old_pos.y);
    return dx == 0 && dy == 0;
  }

  get dead() {
    return this._dead;
  }
}
