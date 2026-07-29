import { Color } from "./lib.js";

class Rectangle {
  constructor(x, y, width, height, params) {
    const { palette, noise, noise_scl, color_scl, shadow, shadow_x, shadow_y } =
      params;

    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._palette = palette;
    this._noise = noise;

    this._visible_nx = x * noise_scl;
    this._visible_ny = y * noise_scl * 32;
    this._color_nx = x * color_scl;
    this._color_ny = y * color_scl;

    this._shadow = shadow;
    this._shadow_x = shadow_x;
    this._shadow_y = shadow_y;

    this._visible = true;
    this._color = new Color(128, 0, 128); // purple for empty palette
  }

  show(ctx) {
    if (!this._visible) return;
    ctx.fillStyle = this._shadow;
    ctx.fillRect(
      this._x + this._shadow_x,
      this._y + this._shadow_y,
      this._width,
      this._height,
    );
    ctx.fillStyle = this._color;
    ctx.fillRect(this._x, this._y, this._width, this._height);
  }

  update(tx, ty) {
    const n1 = this._noise.noise(
      tx,
      ty,
      this._visible_nx + 1000,
      this._visible_ny + 1000,
    );
    this._visible = n1 > 0;
    const n2 = this._noise.noise(tx, ty, this._color_nx, this._color_ny);
    const palette_index = Math.floor(((n2 + 1) / 2) * this._palette.length);
    this._color = this._palette.getColor(palette_index);
  }
}

export { Rectangle };
