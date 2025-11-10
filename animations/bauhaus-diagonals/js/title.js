class Title {
  constructor(x, y, size, fg, bg) {
    this._x = x;
    this._y = y;
    this._size = size;
    this._fg = fg;
    this._bg = bg;

    this._text = "BAUHAUS";
    this._align = "left";
    this._baseline = "top";
    this._font = `${this._size}px Bauhaus`;
  }

  getSize(ctx) {
    ctx.font = this._font;
    const text_metrics = ctx.measureText(this._text);
    const text_width = text_metrics.width;
    const text_height =
      text_metrics.actualBoundingBoxAscent +
      text_metrics.actualBoundingBoxDescent;
    const rounded_width = Math.ceil(text_width / this._size) * this._size;
    const rounded_height = Math.ceil(text_height / this._size) * this._size;

    return {
      rounded_width,
      rounded_height,
    };
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);

    ctx.textAlign = this._align;
    ctx.textBaseline = this._baseline;
    ctx.font = this._font;

    // Calculate text width and height
    const { rounded_width, rounded_height } = this.getSize(ctx);

    // Draw background rectangle
    ctx.fillStyle = this._bg.rgba;
    this.blankBackground(ctx, rounded_width, rounded_height);

    // Draw text
    ctx.fillStyle = this._fg.rgba;
    ctx.fillText(this._text, 0, 0);

    ctx.restore();
  }

  blankBackground(ctx, width, height) {
    ctx.fillRect(-1, -1, width + 2, height + 2);
  }
}

class Subtitle extends Title {
  constructor(x, y, size, fg, bg) {
    super(x, y, size, fg, bg);
    this._text = "1919-1933";
    this._align = "right";
    this._baseline = "bottom";
  }

  blankBackground(ctx, width, height) {
    ctx.fillRect(-width - 1, -height - 1, width + 2, height + 2);
  }
}

export { Title, Subtitle };
