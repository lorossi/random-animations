import { Color } from "./engine.js";

class Clock {
  constructor(x, y, radius, scl) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._scl = scl;

    this._hours = 0;
    this._minutes = 0;
    this._seconds = 0;

    this._fg = Color.fromMonochrome(240);
    this._seconds_fg = Color.fromHex("#FF4136");

    this._captions = ["TIC", "TOC"];
    this._clock_captions = [];
  }

  setTime(hours, minutes, seconds) {
    this._hours = hours % 12;
    this._minutes = (minutes % 60) + seconds / 60;
    this._seconds = seconds % 60;
  }

  setT(t) {
    const total_seconds = t * 12 * 60 * 60; // 12 hours in seconds
    const hours = Math.floor(total_seconds / 3600);
    const minutes = Math.floor((total_seconds % 3600) / 60);
    const seconds = Math.floor(total_seconds % 60);
    this.setTime(hours, minutes, seconds);
  }

  tick() {
    this._seconds += 1;
    if (this._seconds >= 60) {
      this._seconds = 0;
      this._minutes += 1;
      // add caption
      this._addCaption();
    }
    if (this._minutes >= 60) {
      this._minutes = 0;
      this._hours += 1;
    }
    if (this._hours >= 12) {
      this._hours = 0;
    }

    this._clock_captions.forEach((caption) => caption.tick());
  }

  _addCaption() {
    const text = this._captions[0];
    // rotate captions
    this._captions.push(this._captions.shift());

    const font_size = this._radius / 2;
    const speed = this._radius / 30;
    const duration = 60; // frames
    const caption = new ClockCaption(
      text,
      0,
      this._radius / 2,
      font_size,
      speed,
      duration,
      this._fg
    );
    this._clock_captions.push(caption);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.scale(this._scl, this._scl);

    // Draw clock face
    ctx.strokeStyle = this._fg.rgba;
    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, Math.PI * 2);
    ctx.stroke();

    const hours_angle = this._hours * (Math.PI / 6);
    const hours_length = this._radius * 0.6;

    const minutes_angle = this._minutes * (Math.PI / 30);
    const minutes_length = this._radius * 0.75;

    const seconds_angle = this._seconds * (Math.PI / 30);
    const seconds_length = this._radius * 0.9;

    // Draw hour hand
    ctx.strokeStyle = this._fg.rgba;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.save();
    ctx.lineWidth = 3;
    this._drawLine(ctx, hours_angle, hours_length);
    ctx.lineWidth = 2;
    this._drawLine(ctx, minutes_angle, minutes_length);
    ctx.lineWidth = 1;
    ctx.strokeStyle = this._seconds_fg.rgba;
    this._drawLine(ctx, seconds_angle, seconds_length);
    ctx.restore();

    this._clock_captions.forEach((caption) => caption.draw(ctx));

    ctx.restore();
  }

  _drawLine(ctx, angle, length) {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.restore();
  }
}

class ClockCaption {
  constructor(text, x, y, font_size, speed, duration, fg) {
    this._text = text;
    this._x = x;
    this._y = y;
    this._font_size = font_size;
    this._speed = speed;
    this._duration = duration;
    this._fg = fg.copy();

    this._elapsed = 0;
  }

  tick() {
    this._elapsed += 1;
  }

  draw(ctx) {
    if (this.ended) {
      return;
    }

    const alpha = 1 - this._elapsed / this._duration;
    this._fg.a = alpha;

    ctx.save();
    ctx.font = `${this._font_size}px Hack`;
    ctx.fillStyle = this._fg.rgba;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this._text, this._x, this._y - this._elapsed * this._speed);
    ctx.restore();
  }

  get ended() {
    return this._elapsed >= this._duration;
  }
}

export { Clock };
