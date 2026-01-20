import { Engine, XOR128, Palette, PaletteFactory, Color } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._texture_scl = 2;

    this._hex_palettes = [
      ["#031926", "#468189", "#77aca2", "#9dbebb", "#f4e9cd"],
      ["#2d3142", "#bfc0c0", "#ffffff", "#ef8354", "#4f5d75"],
      ["#011627", "#fdfffc", "#2ec4b6", "#e71d36", "#ff9f1c"],
      ["#31393c", "#2176ff", "#33a1fd", "#fdca40", "#f79824"],
      ["#8ecae6", "#219ebc", "#023047", "#ffb703", "#fb8500"],
      ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
      ["#353535", "#3c6e71", "#ffffff", "#d9d9d9", "#284b63"],
    ];
  }

  setup() {
    const seed = new Date().getTime();

    this._xor128 = new XOR128(seed);

    const palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palette = palette_factory.getRandomPalette(this._xor128);

    let sorted_colors = palette.colors.sort((a, b) => b.l - a.l);
    this._bg = sorted_colors.shift();

    const remaining_palette = new Palette(sorted_colors);

    const grid_scl = this._xor128.random(0.4, 0.6);
    const rect_count = this._xor128.random_int(3, 5);
    this._grid = new Grid(
      this.width,
      10,
      grid_scl,
      rect_count,
      this._xor128,
      remaining_palette,
    );

    this._texture = this._createTexture();

    document.body.style.backgroundColor = this._bg.rgba;
  }

  draw() {
    this.noLoop();
    this.ctx.save();
    this.background(this._bg);

    this._grid.show(this.ctx);

    this._applyTexture(this._texture);

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }

  _createTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext("2d");

    ctx.save();
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const ch = this._xor128.random_int(0, 255);
        const color = Color.fromMonochrome(ch, 0.075);
        ctx.fillStyle = color.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }
    ctx.restore();

    return canvas;
  }

  _applyTexture(texture) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(texture, 0, 0);
    this.ctx.restore();
  }
}

export { Sketch };
