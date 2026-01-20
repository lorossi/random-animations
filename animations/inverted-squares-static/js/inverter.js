import { Color, SimplexNoise } from "./lib.js";

class Inverter {
  constructor(x, y, r, seed, noise_scl) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._seed = seed;
    this._noise_scl = noise_scl;

    this._noise = new SimplexNoise(this._seed);
  }

  draw(ctx, points_num = 128) {
    const points = new Array(points_num).fill(null).map((_, i) => {
      const theta = (i / points_num) * Math.PI * 2;
      const nx = 1 + Math.cos(theta);
      const ny = 1 + Math.sin(theta);

      const n = this._noise.noise(this._noise_scl * nx, this._noise_scl * ny);
      const r = (this._r * (n + 1)) / 2;

      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);

      return { x, y };
    });

    const aberration_dist = 2;
    const aberration_colors = [
      Color.fromRGB(255, 0, 255),
      Color.fromRGB(255, 255, 0),
      Color.fromRGB(0, 255, 255),
    ];
    const aberrations = new Array(3).fill(null).map((_, i) => {
      const theta = (i / 3) * Math.PI * 2;
      const x = aberration_dist * Math.cos(theta);
      const y = aberration_dist * Math.sin(theta);
      return { x, y, color: aberration_colors[i] };
    });

    ctx.save();
    ctx.translate(this._x, this._y);

    ctx.save();
    ctx.globalCompositeOperation = "difference";
    ctx.fillStyle = "white";
    ctx.filter = "blur(1px)";

    ctx.beginPath();
    points.forEach(({ x, y }, i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    aberrations.forEach(({ x, y, color }) => {
      ctx.strokeStyle = color.rgba;
      ctx.lineWidth = aberration_dist * 2;
      ctx.beginPath();
      points.forEach(({ x: px, y: py }, i) => {
        if (i === 0) ctx.moveTo(px + x, py + y);
        else ctx.lineTo(px + x, py + y);
      });
      ctx.closePath();
      ctx.stroke();
    });

    ctx.restore();

    ctx.restore();
  }
}

export { Inverter };
