class Bliss {
  constructor(canvas_size, xor128) {
    this._canvas_size = canvas_size.copy();
    this._xor128 = xor128;

    this._img = new Image();
    this._img.src = "./assets/bliss.png";
    this._loaded = false;
    this._img.addEventListener("load", () => (this._loaded = true));

    this._dx = this._xor128.random();
    this._dy = this._xor128.random();
  }

  draw(ctx) {
    if (!this._loaded) return;

    const img_w = this._img.width;
    const img_h = this._img.height;
    const scale = Math.max(
      this._canvas_size.x / img_w,
      this._canvas_size.y / img_h,
    );
    const draw_w = img_w * scale;
    const draw_h = img_h * scale;
    const offset_x = (this._canvas_size.x - draw_w) * this._dx;
    const offset_y = (this._canvas_size.y - draw_h) * this._dy;

    ctx.drawImage(this._img, offset_x, offset_y, draw_w, draw_h);
  }
}

export { Bliss };
