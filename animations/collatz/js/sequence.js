class Pair {
  constructor(n1, n2) {
    this._n1 = n1;
    this._n2 = n2;
  }

  get n1() {
    return this._n1;
  }

  get n2() {
    return this._n2;
  }

  get dir() {
    return this._n1 > this._n2 ? 1 : -1;
  }

  get max() {
    return Math.max(this._n1, this._n2);
  }
}

class Sequence {
  constructor(n, white, r, alpha) {
    this._n = n;
    this._white = white;
    this._r = r;
    this._alpha = alpha;

    this._seq = this._collatz(n);
  }

  show(ctx, scale, t) {
    ctx.save();
    this._drawStart(ctx, scale);
    this._drawEnd(ctx, scale);

    const end = Math.floor(t * this._seq.length);
    const frac = (t * this._seq.length) % 1;

    if (t < 1) {
      this._drawPair(ctx, scale, end, frac);
      this._seq.slice(0, end).forEach((_, i) => this._drawPair(ctx, scale, i));
    } else {
      this._seq.forEach((_, i) => this._drawPair(ctx, scale, i));
    }
    ctx.restore();
  }

  _drawPair(ctx, scale, i, t = 1) {
    const pair = this._seq[i];

    const x1 = pair.n1 * scale;
    const x2 = pair.n2 * scale;

    const w = Math.abs(x2 - x1);
    const c = (x1 + x2) / 2;

    ctx.save();
    ctx.translate(c, 0);

    ctx.strokeStyle = this._white.rgba;
    ctx.globalAlpha = this._alpha;
    ctx.lineWidth = 2;

    ctx.beginPath();
    if (i % 2 == 0) {
      if (x1 < x2) {
        ctx.scale(-1, 1);
      }
      ctx.arc(0, 0, w / 2, 0, Math.PI * t);
    } else {
      if (x1 > x2) {
        ctx.scale(-1, 1);
      }
      ctx.arc(0, 0, w / 2, Math.PI, Math.PI + Math.PI * t);
    }
    ctx.stroke();

    ctx.restore();
  }

  _collatz(n, seq = []) {
    if (n == 1) return seq;
    if (n % 2 == 0) {
      const nn = n / 2;
      return this._collatz.bind(this)(nn, [...seq, new Pair(n, nn)]);
    }

    const nn = 3 * n + 1;
    return this._collatz.bind(this)(nn, [...seq, new Pair(n, nn)]);
  }

  _drawStart(ctx, scale) {
    const x = this._n * scale;
    this._drawCircle(ctx, x);
  }

  _drawEnd(ctx, scale) {
    const x = scale;
    this._drawCircle(ctx, x);
  }

  _drawCircle(ctx, x) {
    ctx.save();
    ctx.fillStyle = this._white.rgba;
    ctx.beginPath();
    ctx.arc(x, 0, this._r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  get max() {
    return this._seq.reduce((acc, pair) => Math.max(acc, pair.max), 0);
  }
}

export { Sequence };
