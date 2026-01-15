import { Engine, Point, Color, XOR128 } from "./lib.js";
import { Drop } from "./drop.js";
import { Umbrella } from "./umbrella.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromHEX("#fdfdff");
    this._umbrella_color = Color.fromHEX("#393d3f");
    this._drop_color = Color.fromHEX("#2482cf");
    this._max_drops = 1000;
    this._drops_per_frame = 2;
    this._drop_size = 3;
    this._umbrella_elasticity = 0.5;
    this._umbrella_cols = 6;
    this._umbrella_rows = 5;
    this._umbrella_scl = 0.75;
    this._width_factor = 0.8;
    this._height_factor = 0.8;

    this._clicked = false;
    this._click_pos = new Point(0, 0);
    this._click_spread = 20;

    this._show_fps = true;

    this._duration = 900;
    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._drops = [];
    this._umbrellas = new Array(this._umbrella_cols * this._umbrella_rows)
      .fill(null)
      .map((_, i) => {
        const x = i % this._umbrella_cols;
        const y = Math.floor(i / this._umbrella_cols);
        const w = (this.width * this._width_factor) / this._umbrella_cols;
        const dy = ((1 - this._height_factor) * this.height) / 2;
        const dx = Math.floor(i / this._umbrella_cols) % 2 == 1 ? w / 2 : 0;

        const pos_x =
          x * w + w / 2 + (this.width * (1 - this._width_factor)) / 2 + dx;
        const pos_y =
          y * w + w / 2 + (this.height * (1 - this._height_factor)) / 2 + dy;
        const size = w * this._umbrella_scl;

        const u = new Umbrella(pos_x, pos_y, size);
        u.setColor(this._umbrella_color);
        u.setElasticity(this._umbrella_elasticity);
        return u;
      });

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const t = (this.frameCount / this._duration) % 1;

    if (this._clicked && this._drops.length < this._max_drops) {
      for (let i = 0; i < this._drops_per_frame; i++) {
        const new_drop = this._createDrop(
          this._click_pos.x,
          this._click_pos.y,
          this._click_spread,
          this._click_spread
        );
        this._drops.push(new_drop);
      }
    }

    this.background(this._bg.rgb);

    this.ctx.save();
    this._drops.forEach((drop) => {
      drop.update(dt);
      drop.show(this.ctx);
    });
    this._umbrellas.forEach((umbrella) => umbrella.show(this.ctx));
    this.ctx.restore();

    this._umbrellas.forEach((umbrella) => {
      this._drops.forEach((drop) => {
        umbrella.bounce(drop);
      });
    });

    this._drops = this._drops
      .filter((drop) => drop.y < this.height)
      .filter((drop) => drop.x > 0 && drop.x < this.width);

    // write drops count and fps
    if (this._show_fps) this._showFps();

    if (t == 0 && this.frameCount > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  _createDrop(x = 0, y = 0, x_spread = 0, y_spread = 0) {
    const dx = this._xor128.random_interval(0, x_spread);
    const dy = this._xor128.random_interval(0, y_spread);
    const a = this._xor128.random(0.5, 1);
    const d = new Drop(x + dx, y + dy, this._drop_size);
    d.setColor(this._drop_color, a);
    return d;
  }

  _showFps() {
    const fps = this.frameRateAverage.toFixed(2);
    const dt_ms = this.deltaTimeAverage.toFixed(2);
    this.ctx.save();
    this.ctx.fillStyle = "black";
    this.ctx.font = "20px monospace";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(`drops: ${this._drops.length}`, 10, 10);
    this.ctx.fillText(`fps: ${fps}`, 10, 30);
    this.ctx.fillText(`dt: ${dt_ms}ms`, 10, 50);
    this.ctx.restore();
  }

  mouseDown(x, y) {
    this._clicked = true;
    this._click_pos = new Point(x, y);
  }

  mouseDragged(x, y) {
    this._click_pos = new Point(x, y);
  }

  mouseUp(x, y) {
    this._clicked = false;
  }
}

export { Sketch };
