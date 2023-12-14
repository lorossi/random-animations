import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Letter } from "./letter.js";

class Sketch extends Engine {
  preload() {
    this._recording = false;
    this._phrase = "FALLING LETTERS";
    this._bg = Color.fromMonochrome(15);
    this._scl = 0.9;
  }

  setup() {
    const letter_scl = (this.width * 2) / 3 / this._phrase.length;
    const split_phrase = this._phrase.split("");

    this._letters = [];
    let x = 0;
    for (let i = 0; i < split_phrase.length; i++) {
      if (i > 0) x += this._letters[i - 1].width;

      const y = 0;
      const letter = split_phrase[i];
      this._letters.push(new Letter(x, y, letter, letter_scl));
    }

    console.log(this._letters);

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

    this._letters.forEach((letter) => letter.show(this.ctx));
    this.ctx.restore();

    //   if (t == 0 && this.frameCount > 0 && this._recording) {
    //     this._recording = false;
    //     this.stopRecording();
    //     console.log("%cRecording stopped. Saving...", "color:yellow");
    //     this.saveRecording();
    //     console.log("%cRecording saved", "color:green");
    //   }
  }
}

export { Sketch };
