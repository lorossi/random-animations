import { Engine, PaletteFactory, Color, XOR128 } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._cols = 7;
    this._rows = 5;
    this._scl = 0.9;
    this._cell_scl = 0.8;
    this._bg_color = Color.fromHEX("#F0EDE1");
    this._texture_scl = 2;
    this._hex_palettes = [
      // https://coolors.co/palette/f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1
      [
        "#f94144",
        "#f3722c",
        "#f8961e",
        "#f9844a",
        "#f9c74f",
        "#90be6d",
        "#43aa8b",
        "#4d908e",
        "#577590",
        "#277da1",
      ],
      // https://coolors.co/palette/f94144-f3722c-f8961e-f9c74f-90be6d-43aa8b-577590
      [
        "#f94144",
        "#f3722c",
        "#f8961e",
        "#f9c74f",
        "#90be6d",
        "#43aa8b",
        "#577590",
      ],
      // https://coolors.co/palette/edae49-d1495b-00798c-30638e-003d5b
      ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"],
      // https://coolors.co/palette/ff595e-ffca3a-8ac926-1982c4-6a4c93
      ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"],
      // https://coolors.co/palette/2d728f-3b8ea5-f5ee9e-f49e4c-ab3428
      ["#2d728f", "#3b8ea5", "#f5ee9e", "#f49e4c", "#ab3428"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    this._grid = new Grid(
      this._rows,
      this._cols,
      this.width,
      this._palette,
      this._seed,
      this._cell_scl,
    );
    document.body.style.backgroundColor = this._bg_color.hex;
  }

  draw() {
    this.ctx.save();
    this.background(this._bg_color);
    this.scaleFromCenter(this._scl);

    this._grid.update();
    this._grid.show(this.ctx);

    this.ctx.restore();

    this._applyTexture();
    this.noLoop();
  }

  click() {
    this.setup();
    this.draw();
  }

  _createTexture() {
    const texture = document.createElement("canvas");
    texture.width = this.width;
    texture.height = this.height;

    const ctx = texture.getContext("2d");
    ctx.save();
    for (let x = 0; x < this.width; x += this._texture_scl) {
      for (let y = 0; y < this.height; y += this._texture_scl) {
        const r = this._xor128.random_int(0, 127);
        const c = Color.fromMonochrome(r, 0.05);
        ctx.fillStyle = c.rgba;
        ctx.fillRect(x, y, this._texture_scl, this._texture_scl);
      }
    }

    return texture;
  }

  _applyTexture() {
    const texture = this._createTexture();
    const pattern = this.ctx.createPattern(texture, "repeat");
    this.ctx.fillStyle = pattern;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

export { Sketch };
