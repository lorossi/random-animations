import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Row } from "./row.js";
class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(235);
    this._fg = Color.fromMonochrome(20);
    this._scl = 0.9;
    this._row_height_scl = 0.1;
    this._texture_scl = 4;
    this._texture_oversize = 1.5;

    this._refresh = 60;
    this._oscillator_started = false;

    this._audio_context = new AudioContext();
    this._oscillator = this._audio_context.createOscillator();
    this._oscillator.type = "sine";
    this._oscillator.connect(this._audio_context.destination);
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._simplex = new SimplexNoise(this._xor128);

    this._generateRows();
    this._last_refresh = this.frameCount;

    this._texture = this._generateTexture(
      this._texture_scl,
      this._texture_oversize,
    );

    document.body.style.backgroundColor = this._bg.darken(0.03).rgb;
  }

  draw() {
    if (this.frameCount - this._last_refresh > this._refresh) {
      this._generateRows();

      const frequency = this._xor128.random_int(600, 1200);
      this._beep(frequency);
      this._last_refresh = this.frameCount;
    }

    this.ctx.save();
    this.background(this._bg);

    this._rows.forEach((line) => line.show(this.ctx));

    // draw the text
    this.ctx.fillStyle = this._fg.rgba;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = `bold ${90}px WarText`;
    this.ctx.fillText(
      "TECHNICAL CANVAS - STAND BY",
      this.width / 2,
      this.height / 2,
    );

    // apply the texture
    const dx = this._xor128.random_int(
      0,
      this.width * (this._texture_oversize - 1),
    );
    const dy = this._xor128.random_int(
      0,
      this.height * (this._texture_oversize - 1),
    );
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(
      this._texture,
      -dx,
      -dy,
      this.width * this._texture_oversize,
      this.height * this._texture_oversize,
    );

    this.ctx.restore();
  }

  click() {
    if (this._oscillator_started) return;

    this._oscillator_started = true;
    this._oscillator.start();
  }

  _generateRows() {
    this._rows_num = this._xor128.random_int(2, 15);

    this._rows_heights = new Array(this._rows_num).fill(0).map((_, i) => {
      const n = this._simplex.noise(i * this._row_height_scl);
      return Math.max(0.1, (n + 1) / 2);
    });

    const height_sum = this._rows_heights.reduce((a, b) => a + b, 0);
    this._rows_heights = this._rows_heights.map(
      (h) => (h / height_sum) * this.height,
    );
    this._lines_y = [0];
    for (let i = 1; i < this._rows_num; i++) {
      this._lines_y[i] = this._lines_y[i - 1] + this._rows_heights[i - 1];
    }

    this._rows = new Array(this._rows_num).fill(0).map((_, i) => {
      const seed = this._xor128.random_int(1e9);
      return new Row(
        this._lines_y[i],
        this.width,
        this._rows_heights[i],
        seed,
        this._fg,
      );
    });
  }

  _generateTexture(texture_scl = 2, oversize = 4) {
    this._texture = new OffscreenCanvas(
      this.width * oversize,
      this.height * oversize,
    );
    const ctx = this._texture.getContext("2d");

    for (let x = 0; x < this._texture.width; x += texture_scl) {
      for (let y = 0; y < this._texture.height; y += texture_scl) {
        const ch = this._xor128.random_int(0, 255);
        const c = Color.fromMonochrome(ch, 0.1);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, texture_scl, texture_scl);
      }
    }

    return this._texture;
  }

  async _beep(frequency = 800, duration = 100) {
    this._oscillator.frequency.setValueAtTime(
      frequency,
      this._audio_context.currentTime,
    );
    await this._sleep(duration);
    this._oscillator.frequency.setValueAtTime(
      0,
      this._audio_context.currentTime,
    );
  }

  async _sleep(delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export { Sketch };
