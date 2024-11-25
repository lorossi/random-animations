import { XOR128 } from "./xor128.js";
import { Color, Point } from "./engine.js";

class Wire {
  constructor(p1, p2, a, points_num = 128) {
    this._p1 = p1;
    this._p2 = p2;
    if (this._p2.x < this._p1.x) [this._p1, this._p2] = [this._p2, this._p1];

    this._fill_color = Color.fromCSS("white");
    this._stroke_color = Color.fromCSS("black");

    const dy = this._p2.y - this._p1.y;
    const dx = this._p2.x - this._p1.x;

    this._points = new Array(points_num).fill(0).map((_, i) => {
      const j = i / points_num;
      const x = this._p1.x + dx * j;
      const y = this._p1.y + dy * j + a * Math.sin((i / points_num) * Math.PI);
      return new Point(x, y);
    });
  }

  show(ctx) {
    ctx.save();
    ctx.strokeStyle = this._stroke_color.rgba;
    ctx.lineWidth = 2;
    ctx.beginPath();
    this._points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    ctx.restore();
  }
}

class Hole {
  constructor(point, radius) {
    this._point = point;
    this._radius = radius;

    this._fill_color = Color.fromCSS("white");
    this._stroke_color = Color.fromCSS("black");

    this._is_connected = false;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this._point.x, this._point.y);
    ctx.fillStyle = this._fill_color.rgba;
    ctx.strokeStyle = this._stroke_color.rgba;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  get is_connected() {
    return this._is_connected;
  }

  set is_connected(value) {
    this._is_connected = value;
  }

  get point() {
    return this._point.copy();
  }

  get x() {
    return this._point.x;
  }

  get y() {
    return this._point.y;
  }

  distance(other) {
    return Math.sqrt(
      (this._point._x - other.x) ** 2 + (this._point.y - other.y) ** 2
    );
  }
}

class Module {
  constructor(point, width, height, xor128) {
    this._point = point.copy();
    this._width = width;
    this._height = height;
    this._xor128 = xor128;

    this._fill_color = Color.fromHEX("#c1121f");
    this._stroke_color = Color.fromCSS("black");

    this._holes = [];
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._fill_color.rgba;
    ctx.strokeStyle = this._stroke_color.rgba;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(this._point.x, this._point.y, this._width, this._height, 10);
    // ctx.rect(this._point.x, this._point.y, this._width, this._height);
    ctx.fill();
    ctx.stroke();

    this._holes.forEach((hole) => hole.show(ctx));

    ctx.restore();
  }

  setHoles(cols, rows) {
    const h_spacing = this._width / cols;
    const v_spacing = this._height / rows;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i + 0.5) * h_spacing + this._point._x;
        const y = (j + 0.5) * v_spacing + this._point._y;
        const p = new Point(x, y);
        const radius = 4;
        this._holes.push(new Hole(p, radius));
      }
    }
  }

  getHoles() {
    return this._holes;
  }

  get x() {
    return this._point.x;
  }

  get y() {
    return this._point.y;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get area() {
    return this._width * this._height;
  }

  overlaps(other) {
    return (
      this._point.x < other._point.x + other.width &&
      this._point.x + this._width > other._point.x &&
      this._point.y < other._point.y + other.height &&
      this._point.y + this._height > other._point.y
    );
  }
}

class Grid {
  constructor(size, cell_size, xor128) {
    this._size = size;
    this._cell_size = cell_size;
    this._xor128 = xor128;

    this._modules = [];
    this._wires = [];
  }

  show(ctx) {
    ctx.save();
    this._modules.forEach((module) => module.show(ctx));
    this._wires.forEach((wire) => wire.show(ctx));
    ctx.restore();
  }

  _createModules(max_tries) {
    const slots = Math.floor(this._size / this._cell_size);

    let tries = 0;
    while (tries < max_tries) {
      const perimeter = this._xor128.random_int(3, 8);
      const w_n = this._xor128.random_int(2, perimeter);
      const h_n = perimeter - w_n;

      const w = w_n * this._cell_size;
      const h = h_n * this._cell_size;
      const x = this._xor128.random_int(slots - w_n) * this._cell_size;
      const y = this._xor128.random_int(slots - h_n) * this._cell_size;
      const p = new Point(x, y);

      const new_module = new Module(p, w, h, this._xor128);
      if (!this._modules.some((module) => module.overlaps(new_module))) {
        this._modules.push(new_module);

        if (this._xor128.random() > 0.5) {
          const cols = this._xor128.random_int(1, w_n);
          const rows = this._xor128.random_int(1, h_n);
          new_module.setHoles(cols, rows);
        }

        tries = 0;
      } else {
        tries++;
      }
    }
  }

  _createWires() {
    const holes = this._modules
      .map((module) => module.getHoles())
      .filter((holes) => holes.length > 0)
      .filter(() => this._xor128.random() > 1 / 3);

    this._wires = [];

    holes.forEach((module) => {
      // extract all holes from all modules
      module.forEach((hole) => {
        if (hole.is_connected) return;
        const other_holes = holes
          .filter((other_module) => other_module !== module)
          .flat()
          .filter((hole) => !hole.is_connected)
          .filter(
            (other_hole) => other_hole.x !== hole.x && other_hole.y !== hole.y
          )
          .sort((a, b) => a.distance(module) - b.distance(module))
          .slice(0, 3);

        if (other_holes.length === 0) return;

        // pick a random hole from the other holes
        const other_hole = this._xor128.pick(other_holes);
        hole.is_connected = true;
        other_hole.is_connected = true;

        const a = this._xor128.random_int(10, 100);
        this._wires.push(new Wire(hole.point, other_hole.point, a));
      });
    });
  }

  populate(max_tries = 1e3) {
    this._createModules(max_tries);
    this._createWires();
  }
}

export { Grid, Module };
