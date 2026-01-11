import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Circle } from "./circle.js";
import { Cutter, CUT_SIDE } from "./cutter.js";
import { Spray, SPRAY_DIRECTION } from "./spray.js";
import { Rotator, ROTATOR_DIRECTION } from "./rotator.js";
import { Assembler, ASSEMBLE_SIDE } from "./assembler.js";

class Sketch extends Engine {
  preload() {
    this._cols = 10;
    this._scl = 0.9;
    this._circle_scl = 0.5;
    this._bg = Color.fromMonochrome(64);
    this._circle_color = Color.fromMonochrome(230);
    this._epoch_duration = 20;

    this._recording = false;
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    this._grid_size = this.width / this._cols;
    this._circle_size = this._grid_size * this._circle_scl;

    this._circles = [
      new Circle(0, 0, this._circle_size, this._grid_size, this._circle_color),
    ];

    this._cutters = new Array(4)
      .fill(0)
      .map(
        (_, i) =>
          new Cutter(
            this._cols - 1,
            i * 2,
            this._grid_size,
            this._circle_size,
            CUT_SIDE.RIGHT
          )
      );

    const spray_colors = [
      Color.fromHEX("#fdca40"),
      Color.fromHEX("#df2935"),
      Color.fromHEX("#3772ff"),
      Color.fromHEX("#080708"),
    ];
    const process_sprays = new Array(spray_colors.length)
      .fill(0)
      .map(
        (_, i) =>
          new Spray(
            1,
            i * 2 + 1,
            this._grid_size,
            this._circle_size,
            spray_colors[i],
            SPRAY_DIRECTION.LEFT
          )
      );
    const reset_sprays = new Array(4)
      .fill(0)
      .map(
        (_, i) =>
          new Spray(
            this._cols - 2 - i * 2,
            this._cols - 1,
            this._grid_size,
            this._circle_size,
            this._circle_color,
            SPRAY_DIRECTION.BOTTOM
          )
      );
    this._sprays = [...process_sprays, ...reset_sprays];

    const process_rotators = new Array(3)
      .fill(0)
      .map(
        (_, i) =>
          new Rotator(
            Math.floor(this._cols / 2),
            (i + 1) * 2,
            this._grid_size,
            this._circle_size,
            ROTATOR_DIRECTION.COUNTER_CLOCKWISE
          )
      );
    const left_reset_rotators = new Array(3)
      .fill(0)
      .map(
        (_, i) =>
          new Rotator(
            0,
            this._cols - 4 - 2 * i,
            this._grid_size,
            this._circle_size,
            ROTATOR_DIRECTION.CLOCKWISE
          )
      );
    const bottom_reset_rotators = new Array(3)
      .fill(0)
      .map(
        (_, i) =>
          new Rotator(
            this._cols - 3 - 2 * i,
            this._cols - 1,
            this._grid_size,
            this._circle_size,
            ROTATOR_DIRECTION.COUNTER_CLOCKWISE
          )
      );

    this._rotators = [
      ...process_rotators,
      ...left_reset_rotators,
      ...bottom_reset_rotators,
    ];

    this._assemblers = new Array(4)
      .fill(0)
      .map(
        (_, i) =>
          new Assembler(
            0,
            this._cols - 3 - i * 2,
            this._grid_size,
            this._circle_size,
            this._circle_color,
            ASSEMBLE_SIDE.LEFT
          )
      );

    this._frame_offset = this.frameCount;

    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw() {
    // const t = (this.frameCount / this._duration) % 1;

    const count = this.frameCount - this._frame_offset;
    const epoch = Math.floor(count / this._epoch_duration);
    const epoch_t = (count % this._epoch_duration) / this._epoch_duration;
    const moving_epoch = epoch % 2 == 0;

    this.ctx.save();

    this.ctx.fillStyle = this._bg.rgba;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    if (moving_epoch && epoch_t == 0) this._setCirclesDestination();
    if (!moving_epoch && epoch_t == 0.5) {
      this._cutCircles();
      this._assembleCircles();
    }
    if (!moving_epoch && epoch_t == 0) {
      this._sprayCircles();
      this._rotateCircles();
    }

    this.ctx.save();
    this._cutters.forEach((c) => {
      if (!moving_epoch) c.update(epoch_t);
      c.show(this.ctx);
    });
    this.ctx.restore();

    this.ctx.save();
    this._assemblers.forEach((i) => {
      if (!moving_epoch) i.update(epoch_t);
      i.show(this.ctx);
    });
    this.ctx.restore();

    this.ctx.save();
    this._rotators.forEach((r) => {
      if (!moving_epoch) r.update(epoch_t);
      r.show(this.ctx);
    });
    this.ctx.restore();

    this.ctx.save();
    this._sprays.forEach((s) => {
      if (!moving_epoch) s.update(epoch_t);
      s.show(this.ctx);
    });
    this.ctx.restore();

    this.ctx.save();
    this._circles.forEach((c) => {
      if (moving_epoch) c.updatePosition(epoch_t);
      else {
        c.updateColor(epoch_t);
        c.updateRotation(epoch_t);
      }
      c.show(this.ctx);
    });
    this.ctx.restore();

    this.ctx.restore();

    if (
      epoch_t == 0.5 &&
      moving_epoch &&
      this._circles.length < this._cols * this._cols
    ) {
      const circle = new Circle(
        0,
        0,
        this._circle_size,
        this._grid_size,
        this._circle_color
      );
      this._circles.push(circle);
    }
  }

  _setCirclesDestination() {
    this._circles.forEach((c) => {
      const x = c.x;
      const y = c.y;

      if (x == 0 && y == 0) c.moveRight();
      else if (x < this._cols - 1 && x > 0 && y % 2 == 0) c.moveRight();
      else if (x > 1 && y % 2 == 1) c.moveLeft();
      else if ((x == this._cols - 1 || x == 1) && y < this._cols - 1)
        c.moveDown();
      else if (x == 1 && y == this._cols - 1) c.moveLeft();
      else if (x == 0 && y > 0) c.moveUp();
    });
  }

  _cutCircles() {
    this._cutters.forEach((cutter) => {
      const x = cutter.x;
      const y = cutter.y;

      const circle = this._circles.find((c) => c.x == x && c.y == y);
      if (circle) circle.cut(cutter.circle_cut_side);
    });
  }

  _sprayCircles() {
    this._sprays.forEach((spray) => {
      const x = spray.x;
      const y = spray.y;

      const circle = this._circles.find((c) => c.x == x && c.y == y);
      if (circle) circle.setColor(spray.color, spray.circle_spray_side);
    });
  }

  _rotateCircles() {
    this._rotators.forEach((rotator) => {
      const x = rotator.x;
      const y = rotator.y;

      const circle = this._circles.find((c) => c.x == x && c.y == y);

      if (circle) circle.setRotation(rotator.angle, rotator.direction);
    });
  }

  _assembleCircles() {
    this._assemblers.forEach((assembler) => {
      const x = assembler.x;
      const y = assembler.y;

      const circle = this._circles.find((c) => c.x == x && c.y == y);
      if (circle === undefined) return;

      if (circle.getCut(assembler.circle_assembled_side))
        circle.assemble(assembler.circle_assembled_side);
    });
  }

  click() {
    this.setup();
  }
}

export { Sketch };
