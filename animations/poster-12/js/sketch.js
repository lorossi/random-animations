import { Engine } from "./lib.js";

import {
  Color,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  Utils,
  XOR128,
} from "./lib.js";

import { Arc } from "./arc.js";

class Sketch extends Engine {
  preload() {
    this._hex_palettes = [
      ["#a4243b", "#d8c99b", "#d8973c", "#bd632f", "#273e47"],
      ["#335c67", "#fff3b0", "#e09f3e", "#9e2a2b", "#540b0e"],
      ["#f4f1de", "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f"],
      ["#001524", "#15616d", "#ffecd1", "#ff7d00", "#78290f"],
    ];
    this._texture_scl = 2;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e6));

    const palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palette = palette_factory.getRandomPalette(this._xor128, true);

    const [bg, ...colors] = palette.colors;

    const new_palette = new Palette(colors);
    const arcs_count = this._xor128.random_int(10, 20);

    this._arc_width = this.width / arcs_count / 2;

    this._arcs = new Array(arcs_count)
      .fill()
      .map((_, i) => {
        const height = this.height / 2;
        const radius = this._arc_width * (i + 1);
        const color_i = this._xor128.random_int(colors.length);
        const fill = new_palette.getColor(color_i);
        const stroke = new_palette.getColor(color_i + 1);
        return new Arc(radius, this._arc_width, height, fill, stroke);
      })
      .map((arc) => ({ arc: arc, order: this._xor128.random() }))
      .sort((a, b) => a.order - b.order)
      .map((obj) => obj.arc);

    this._bg = bg;
    this._noise_scl = this._xor128.random(0.001, 0.002);

    this._texture = this._generate_texture();
    document.body.style.background = this._bg.hex;
  }

  draw(dt) {
    this.ctx.save();
    this.scaleFromCenter(0.99); // scale to avoid borders beig cut off
    this.background(this._bg);

    this.ctx.translate(this.width / 2, this.height / 2);
    this._arcs.forEach((arc, i) => {
      const x = (i / this._arcs.length) * this.width;
      const n = this._noise.noise(x * this._noise_scl, 1000);
      const angle = Math.floor(Utils.remap(n, -1, 1, 0, 4)) * (Math.PI / 2);
      this.ctx.save();

      this.ctx.rotate(angle);
      arc.draw(this.ctx);
      this.ctx.restore();
    });
    this.ctx.restore();

    this._apply_texture(this._texture, this.ctx);

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }

  _generate_texture() {
    const texture_canvas = document.createElement("canvas");
    texture_canvas.width = this.width / this._texture_scl;
    texture_canvas.height = this.height / this._texture_scl;
    const texture_ctx = texture_canvas.getContext("2d");

    for (let x = 0; x < texture_canvas.width; x++) {
      for (let y = 0; y < texture_canvas.height; y++) {
        const n = this._xor128.random_int(256);
        const c = Color.fromMonochrome(n, 0.015);

        texture_ctx.fillStyle = c.rgba;
        texture_ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return texture_canvas;
  }

  _apply_texture(texture, ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.scale(this._texture_scl, this._texture_scl);
    ctx.drawImage(texture, 0, 0, this.width, this.height);
    ctx.restore();
  }
}

export { Sketch };
