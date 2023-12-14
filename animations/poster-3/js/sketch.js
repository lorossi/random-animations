import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Letter } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(15);
    this._scl = 0.95;
    this._texture_size = 4;

    this._ordered = true;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._letters = [new Letter(0, 0, this.width, this._xor128)];
    // split all the cells until they can't be split anymore
    while (this._letters.some((l) => l.can_split)) {
      const new_letters = [];
      this._letters.forEach((ll) => {
        new_letters.push(...ll.split());
      });
      this._letters = new_letters;
    }

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    this.noLoop();

    this.background(this._bg.rgba);
    this.ctx.save();

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._letters.forEach((l) => l.show(this.ctx));
    this.ctx.restore();

    this._addTexture();
  }

  _addTexture() {
    this.ctx.save();
    for (let x = 0; x < this.width; x += this._texture_size) {
      for (let y = 0; y < this.height; y += this._texture_size) {
        const n = this._xor128.random(137);
        const c = Color.fromMonochrome(n, 0.05);

        this.ctx.fillStyle = c.rgba;
        this.ctx.fillRect(x, y, this._texture_size, this._texture_size);
      }
    }
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
