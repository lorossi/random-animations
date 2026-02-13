import { Engine, XOR128, Color } from "./lib.js";
import { Letter } from "./letter.js";

class Sketch extends Engine {
  preload() {
    this._cols = 15;
    this._bg = Color.fromMonochrome(255);
    this._accent = Color.fromHEX("#a10202");
    this._scl = 0.9;
    this._texture_scl = 2;
    this._texture_oversize = 1.1;
    this._to_spell = "MAKEITSTOP";
    this._font = "RobotoMono";
    this._duration = 600;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const letter_size = this.width / this._cols;

    this._letters = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const l = new Letter(x, y, letter_size, this._font);
      l.setAttributes(this._duration);
      l.injectDependencies(this._xor128);
      return l;
    });

    // select letters from a random row and column
    const row = this._xor128.random_int(1, this._cols - 1);
    const col = this._xor128.random_int(
      1,
      this._cols - this._to_spell.length - 1,
    );

    this._letters
      .filter((l) => l.y == row && l.x >= col)
      .slice(0, this._to_spell.length)
      .forEach((l, i) => {
        l.setLetter(this._to_spell[i]);
        l.setColor(this._accent);
        l.freeze();
      });

    this._font_loaded = false;
    document.fonts
      .load(`10px ${this._font}`)
      .then(() => (this._font_loaded = true));

    this._texture = this._createTexture();

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (!this._font_loaded) {
      return;
    }
    this.background(this._bg.rgba);
    this.ctx.save();

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._letters.forEach((l) => l.show(this.ctx));
    this.ctx.restore();

    this._addTexture();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(this.width * this._texture_oversize);
    canvas.height = Math.floor(this.height * this._texture_oversize);
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < canvas.width; x += this._texture_scl) {
      for (let y = 0; y < canvas.height; y += this._texture_scl) {
        const n = this._xor128.random(127);
        const c = Color.fromMonochrome(n, 0.1);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return canvas;
  }

  _addTexture() {
    const dx = Math.floor(
      this._xor128.random_int(0, this._texture.width - this.width),
    );
    const dy = Math.floor(
      this._xor128.random_int(0, this._texture.height - this.height),
    );

    this.ctx.save();
    this.ctx.globalCompositeOperation = "dodge";
    this.ctx.drawImage(
      this._texture,
      dx,
      dy,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height,
    );
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
