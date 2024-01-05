import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Cell } from "./cell.js";

class Sketch extends Engine {
  preload() {
    this._duration = 300;
    this._recording = false;

    this._cubes_num = 40;
    this._scl = 0.9;

    this._letter_bg = Color.fromMonochrome(240);
    this._letter_fg = Color.fromMonochrome(15);
    this._bg = new Color(139, 0, 0);

    this._texture_scl = 3;
    this._texture_size = this.width * 1.25;

    this._words;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    // height of the letter
    const letter_scl = this.height / this._cubes_num;
    // max length of the word
    const max_length = this.width / letter_scl;

    this._cell = new Cell(
      letter_scl,
      this._cubes_num,
      max_length,
      this._xor128
    );
    this._cell.setColor(this._letter_fg, this._letter_bg);

    this._texture = this._createTexture();

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    const t = (this.frameCount / this._duration) % 1;

    this.ctx.save();
    this.background(this._bg);

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(0, -this.height / 2);

    this._cell.update(t);
    this._cell.show(this.ctx);

    this.ctx.restore();

    // apply texture
    this.ctx.globalCompositeOperation = "multiply";
    // paste the texture with a random offset
    const dx_offset = this._xor128.random_int(
      0,
      this._texture_size - this.width
    );
    const dy_offset = this._xor128.random_int(
      0,
      this._texture_size - this.height
    );

    this.ctx.drawImage(this._texture, -dx_offset, -dy_offset);

    this.ctx.restore();

    if (t >= 1 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createTexture() {
    const texture = document.createElement("canvas");
    texture.width = this._texture_size;
    texture.height = this._texture_size;

    const ctx = texture.getContext("2d");

    for (let x = 0; x < texture.width; x += this._texture_scl) {
      for (let y = 0; y < texture.height; y += this._texture_scl) {
        const n = this._xor128.random(127);
        const c = Color.fromMonochrome(n, 0.15);

        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return texture;
  }

  click() {
    if (this._recording) return;

    this.setup();
  }
}

export { Sketch };
