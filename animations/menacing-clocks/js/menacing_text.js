class MenacingText {
  constructor(x, y, font_size, fg, bg, duration, allow_repeat = false) {
    this._x = x;
    this._y = y;
    this._font_size = font_size;
    this._fg = fg;
    this._bg = bg;
    this._duration = duration;
    this._allow_repeat = allow_repeat;

    this._text = ["TIME", "IS", "RUNNING", "OUT"];
    this._elapsed = 0;
  }

  update() {
    this._elapsed++;
  }

  draw(ctx) {
    if (this.ended && !this._allow_repeat) return;

    const current_text_index =
      Math.floor(this._elapsed / this._duration) % this._text.length;
    const text = this._text[current_text_index];

    ctx.save();
    ctx.font = `${this._font_size}px Hack`;

    const font_metrics = ctx.measureText(text);
    const padding = this._font_size * 0.2;
    const rect_width = font_metrics.width + padding * 2;
    const rect_height = this._font_size + padding * 2;

    ctx.fillStyle = this._bg.rgba;
    ctx.strokeStyle = this._fg.rgba;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(
      this._x - rect_width / 2,
      this._y - rect_height / 2,
      rect_width,
      rect_height,
    );
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this._fg.rgba;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, this._x, this._y + this._font_size * 0.1);

    ctx.restore();
  }

  reset() {
    this._elapsed = 0;
  }

  get ended() {
    return this._elapsed >= this._duration * this._text.length;
  }

  get last_frame() {
    const full_duration = this._duration * this._text.length;
    return this._elapsed % full_duration === full_duration - 1;
  }
}

export { MenacingText };
