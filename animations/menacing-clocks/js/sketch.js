import { Engine, XOR128, Color } from "./lib.js";
import { Clock } from "./clock.js";
import { MenacingText } from "./menacing_text.js";

const PHASES = {
  STATIONARY: 0,
  INCREASING: 1,
  DECREASING: 2,
};

class Sketch extends Engine {
  preload() {
    this._clock_scl = 0.85;
    this._text_duration = 60;
    this._max_texts = 500;

    this._min_text_delay = 30;
    this._max_text_delay = 90;

    this._bg = Color.fromMonochrome(20);
    this._fg = Color.fromMonochrome(240);
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    let rows = this._xor128.random_int(10, 20);
    if (rows % 2 == 0) rows++;

    const clock_size = this.height / rows;
    this._clocks = new Array(rows * rows).fill(0).map((_, i) => {
      const x = i % rows;
      const y = Math.floor(i / rows);

      const xx = x * clock_size + clock_size / 2;
      const yy = y * clock_size + clock_size / 2;
      const r = clock_size / 2;
      return new Clock(xx, yy, r, this._clock_scl);
    });
    this._clocks.forEach((clock) => clock.setT(this._xor128.random()));

    this._center_text = this._firstText();
    this._texts = [];

    this._next_text_frame =
      this.frameCount +
      this._xor128.random_int(this._min_text_delay, this._max_text_delay);
    this._current_phase = PHASES.INCREASING;

    document.body.style.background = this._bg.hex;
  }

  draw() {
    this.ctx.save();
    this.background(this._bg);

    this._clocks.forEach((clock) => {
      clock.tick();
      clock.draw(this.ctx);
    });

    // always draw the center text
    this._center_text.update();
    this._center_text.draw(this.ctx);

    this._texts.forEach((text) => {
      text.update();
      text.draw(this.ctx);
    });

    this.ctx.restore();

    let new_texts = [];

    if (this._current_phase == PHASES.INCREASING) {
      // add new texts at random time intervals
      if (this.frameCount >= this._next_text_frame) {
        this._texts.push(this._newText());
        this._next_text_frame =
          this.frameCount +
          this._xor128.random_int(this._min_text_delay, this._max_text_delay);
      }

      // check ended texts and add new ones
      this._texts.forEach((text) => {
        if (text.ended && this._texts.length < this._max_texts) {
          // the text has ended and there is room for more texts
          new_texts.push(this._newText());
          new_texts.push(this._newText());
        } else if (!text.ended) {
          // no action, keep the text
          new_texts.push(text);
        }
      });

      // check if we reached max texts
      if (new_texts.length >= this._max_texts) {
        this._current_phase = PHASES.DECREASING;
      }

      // update texts
      this._texts = new_texts;
    } else if (this._current_phase == PHASES.DECREASING) {
      // remove ended texts
      this._texts = this._texts.filter((text) => !text.ended);

      // if no texts left, exit decreasing phase
      if (this._texts.length == 0) {
        this._current_phase = PHASES.STATIONARY;
      }
    } else if (this._current_phase == PHASES.STATIONARY) {
      // do nothing until center text ends
      if (this._center_text.last_frame) {
        this._center_text.reset();
        this._current_phase = PHASES.INCREASING;
      }
    }
  }

  _newText(x = null, y = null, allow_repeat = false) {
    if (x === null) x = this._xor128.random_int(this.width);
    if (y === null) y = this._xor128.random_int(this.height);

    return new MenacingText(
      x,
      y,
      this.height / 15,
      this._fg,
      this._bg,
      this._text_duration,
      allow_repeat,
    );
  }

  _firstText() {
    return this._newText(
      this.width / 2,
      this.height / 2,
      true /* allow repeat */,
    );
  }

  click() {
    this.setup();
  }
}

export { Sketch };
