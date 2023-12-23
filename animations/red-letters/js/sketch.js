import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Letter } from "./letter.js";

class Sketch extends Engine {
  preload() {
    this._cols = 15;
    this._bg = Color.fromMonochrome(255);
    this._accent = Color.fromHEX("#8a0303");
    this._scl = 0.9;
    this._texture_size = 4;
    this._to_spell = "MAKEITSTOP";
    this._duration = 600;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    const letter_size = this.width / this._cols;

    this._letters = new Array(this._cols ** 2).fill(0).map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);

      const l = new Letter(x, y, letter_size);
      l.setAttributes(this._duration);
      l.injectDependencies(this._xor128);
      return l;
    });

    // select letters from a random row and column
    const row = this._xor128.random_int(1, this._cols - 1);
    const col = this._xor128.random_int(
      1,
      this._cols - this._to_spell.length - 1
    );

    this._letters
      .filter((l) => l.y == row && l.x >= col)
      .slice(0, this._to_spell.length)
      .forEach((l, i) => {
        l.setLetter(this._to_spell[i]);
        l.setColor(this._accent);
        l.freeze();
      });

    this._texture = this._createTexture();

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
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
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < this.width; x += this._texture_size) {
      for (let y = 0; y < this.height; y += this._texture_size) {
        const n = this._xor128.random(255);
        const c = Color.fromMonochrome(n, 0.05);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_size, this._texture_size);
      }
    }

    return canvas;
  }

  _addTexture() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(this._texture, 0, 0);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
