import { Color, Engine, Point, XOR128 } from "./lib.js";

import { Circle } from "./circle.js";

class Sketch extends Engine {
  preload() {
    this._colors = [Color.fromMonochrome(20), Color.fromMonochrome(235)];

    this._scl = 0.9;
    this._circle_scl = 0.5;
    this._phase_margin = 3;

    this._phase_duration = 30;
    this._phases_per_transform = 4;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    [this._bg, this._fg] = this._xor128.shuffle_array(this._colors);

    this._slots = this._xor128.random_int(4, 15);
    if (this._slots % 2 == 1) this._slots++; // make even number

    const circle_radius = this.width / this._slots / 2;
    this._circles = new Array(this._slots ** 2).fill(0).map((_, i) => {
      const x = i % this._slots;
      const y = Math.floor(i / this._slots);
      const pos = new Point(x, y);
      return new Circle(pos, circle_radius, this._circle_scl, this._fg);
    });

    this._setupTransform();

    this._current_phase = 0;

    document.body.style.background = this._bg.hex;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  _easeInOutPoly(x, n = 15) {
    if (x < 0.5) return 0.5 * Math.pow(2 * x, n);
    return 1 - 0.5 * Math.pow(2 * (1 - x), n);
  }

  _setupTransform() {
    let transforms = [];
    for (const dx of [-1, 1]) {
      for (const dy of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
          transforms.push({
            scl_flip: [dx * this._scl, dy * this._scl],
            rotation: (Math.PI / 2) * i,
          });
        }
      }
    }

    this._transforms = transforms
      .map((t) => ({ t: t, order: this._xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((t) => ({ ...t.t }));
  }

  _indexToPos(index) {
    const x = index % this._slots;
    const y = Math.floor(index / this._slots);
    return [x, y];
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._phase_duration) % 1;

    if (t == 0) {
      const transform_index =
        Math.floor(
          delta_frame / (this._phase_duration * this._phases_per_transform),
        ) % this._transforms.length;
      this._current_transform = this._transforms[transform_index];

      if (this._recording) {
        this._recording = false;
        this.stopRecording();
        console.log("%cRecording stopped. Saving...", "color:yellow");
        this.saveRecording();
        console.log("%cRecording saved", "color:green");
      }
    }

    const phase_frame = delta_frame % this._phase_duration;
    const phase_t = phase_frame / this._phase_duration;
    const eased_t = this._easeInOutPoly(phase_t, 5);

    if (phase_frame == 0) {
      this._circles.forEach((circle, i) => {
        circle.resetDestination();
        const [x, y] = this._indexToPos(i);
        if (x == 0 && y > 0) {
          // first column, not first row
          circle.setDestination(new Point(0, y - 1));
        } else if (y == 0 && x < this._slots - 1) {
          // first row, not last column
          circle.setDestination(new Point(x + 1, 0));
        } else if (x == this._slots - 1 && y % 2 == 0) {
          // last column, even row
          circle.setDestination(new Point(x, y + 1));
        } else if (x > 1 && y % 2 == 1) {
          // odd row, not first two columns
          circle.setDestination(new Point(x - 1, y));
        } else if (x == 1 && y % 2 == 1 && y < this._slots - 1) {
          // odd row, second column
          circle.setDestination(new Point(1, y + 1));
        } else if (x > 0 && y % 2 == 0 && y < this._slots - 1) {
          // even row, not first two columns, not last row
          circle.setDestination(new Point(x + 1, y));
        } else if (x == 1 && y == this._slots - 1) {
          // last row, second column
          circle.setDestination(new Point(x - 1, y));
        }
      });
    } else if (phase_frame == this._phase_duration - 1) {
      this._current_phase += 1;
      if (this._current_phase >= this._phases) {
        this._current_phase = 0;
        this._setupTransform();
        return;
      }
    }

    this.ctx.save();
    this.background(this._bg);
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(this._current_transform.rotation);
    this.ctx.scale(
      this._current_transform.scl_flip[0],
      this._current_transform.scl_flip[1],
    );
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._circles.forEach((circle) => {
      circle.update(eased_t);
      circle.draw(this.ctx);
    });

    this.ctx.restore();
  }

  click() {
    this.setup();
  }
}

export { Sketch };
