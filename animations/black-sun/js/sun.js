import { Color, SimplexNoise } from "./lib.js";

class Sun {
  constructor(inner_radius, outer_radius, seed, rays_count) {
    this._inner_radius = inner_radius;
    this._outer_radius = outer_radius;
    this._seed = seed;
    this._rays_count = rays_count;

    this._bends = 16;
    this._noise = new SimplexNoise(this._seed);
    this._rays = [];

    this._fg = Color.fromMonochrome(240);
    this._ray_fg = this._fg.copy();
    this._ray_fg.a = 0.25;

    this._current_r = this._inner_radius;
  }

  update(tx, ty, noise_scale) {
    this._rays = new Array(this._bends * 5).fill(0).map((_, j) => {
      const n = this._noise.noise(tx, ty, (j * noise_scale) / this._bends);
      return ((n + 1) / 2) * Math.PI;
    });

    const n = this._noise.noise(tx, ty, 1000);
    this._current_r =
      this._inner_radius + ((n + 1) / 2) * 0.25 * this._inner_radius;
  }

  show(ctx, stagger) {
    ctx.save();

    ctx.strokeStyle = this._fg.rgba;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this._current_r, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(
      -ctx.canvas.width / 2,
      -ctx.canvas.height / 2,
      ctx.canvas.width,
      ctx.canvas.height,
    );
    ctx.arc(0, 0, this._current_r, 0, 2 * Math.PI, true);
    ctx.clip("evenodd");

    // clip rays to the inner circle
    ctx.strokeStyle = this._ray_fg.rgba;
    ctx.lineWidth = 2;

    for (let i = 0; i < this._rays_count; i++) {
      const angle = (i / this._rays_count) * 2 * Math.PI;
      const dr = (this._outer_radius - this._inner_radius) / this._bends;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(this._inner_radius, 0);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      let x = 0;
      let y = 0;

      for (let j = 0; j < this._bends; j++) {
        const r = this._rays[(i + j * stagger) % this._rays.length];
        x += dr * Math.cos(r);
        y += dr * Math.sin(r);
        ctx.lineTo(x, y);
      }

      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }
}

export { Sun };
