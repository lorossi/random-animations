import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";

class Sketch extends Engine {
  preload() {
    this._level = 8;
    this._scl = 0.95;
    this._all_at_once = false; // if true, draw all at once
    this._one_at_time = true; // if true, draw one line at time
    this._color_repeat = true; // if true, repeat colors the same amount of times as the level
    this._black_and_white = false; // if true, draw in black and white
    this._duration = 600;

    this._background_color = Color.fromMonochrome(15);
  }
  setup() {
    this._current = 0;
    this._curve = this._hilbertLSystem(this._level);
    this._curve_scl = this.width / (2 ** this._level - 1);

    this._steps_per_frame = this._one_at_time
      ? 1
      : Math.ceil(this._curve.length / this._duration);
    this._actual_duration = Math.ceil(
      this._curve.length / this._steps_per_frame
    );

    this.ctx.resetTransform();
    this.background(this._background_color.rgb);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._transformations = this.ctx.getTransform();
    console.log(
      `Steps per frame: ${this._steps_per_frame}, duration: ${this._actual_duration} frames`
    );
    if (this._recording && !this._all_at_once) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    if (this._current >= this._curve.length) return;

    if (this._all_at_once) {
      this._drawFullCurve();
      this._current = this._curve.length;
    } else {
      for (
        let i = 0;
        i < this._steps_per_frame && this._current + i < this._curve.length;
        i++
      ) {
        this._drawStep(this._current);
        this._current++;
      }
    }

    if (this._recording && this._current >= this._curve.length) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _drawFullCurve() {
    this._curve.forEach((_, i) => this._drawStep(i));
  }

  _drawStep(i) {
    const c = this._curve[i];

    if (this._black_and_white) {
      this.ctx.strokeStyle = Color.fromMonochrome(245).rgb;
    } else {
      const repetitions = this._color_repeat ? this._level : 1;
      const hue = ((i / this._curve.length) * repetitions * 360) % 360;
      const stroke = Color.fromHSL(hue, 100, 50);
      this.ctx.strokeStyle = stroke.rgb;
    }

    if (this._level <= 3) this.ctx.lineWidth = 3;
    else if (this._level <= 5) this.ctx.lineWidth = 2;
    else this.ctx.lineWidth = 1;

    this.ctx.setTransform(this._transformations);
    for (let cc of c) {
      switch (cc) {
        case "+":
          this.ctx.rotate(Math.PI / 2);
          break;
        case "-":
          this.ctx.rotate(-Math.PI / 2);
          break;
        case "F":
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.lineTo(0, this._curve_scl);
          this.ctx.stroke();
          this.ctx.translate(0, this._curve_scl);
          break;
      }
    }
    this._transformations = this.ctx.getTransform();
  }

  _hilbertLSystem(levels) {
    // expand hilbert curve using L-system
    const expand = (s, n) => {
      if (n == 0) return s;

      let res = "";
      for (let c of s) {
        if (c in rules) res += expand(rules[c], n - 1);
        else res += c;
      }

      return res;
    };

    // L-system rules
    const rules = {
      A: "-BF+AFA+FB-",
      B: "+AF-BFB-FA+",
    };
    const axiom = "A";
    let str = expand(axiom, levels);

    // remove non-terminals and redundant rotations
    const to_remove = ["A", "B", "+-", "-+"];
    for (let c of to_remove) str = str.replaceAll(c, "");

    // group by F and +/-
    let curve = [];
    let accumulator = "";
    for (let i = 0; i < str.length; i++) {
      accumulator += str[i];
      if (str[i] == "F") {
        curve.push(accumulator);
        accumulator = "";
      }
    }

    return curve;
  }

  click() {
    this.setup();
  }

  keyPress(_, code) {
    switch (code) {
      case 13: // enter
        this.saveFrame();
        break;
      case 32: // space
        this.setup();
        break;
      case 119: // w
        this._level++;
        this.setup();
        break;
      case 115: // s
        this._level = Math.max(1, this._level - 1);
        this.setup();
        break;
      default:
        break;
    }
  }
}

export { Sketch };
