import { Engine, XOR128, Palette, PaletteFactory, Color } from "./lib.js";
import { Grid } from "./grid.js";

class Sketch extends Engine {
  preload() {
    this._grid_cols = 21;
    this._grid_noise_scl = 0.5;
    this._grid_noise_amplitude = 5;
    this._destinations_num = 20;
    this._bg_color = Color.fromHEX("#f4f1de");

    this._hex_palettes = [
      // https://pinterest.com/pin/216876538286161490/
      [
        "#fde8cd",
        "#d0514b",
        "#29607f",
        "#44896a",
        "#97b68a",
        "#e79972",
        "#e1af32",
      ],
      // https://pinterest.com/pin/1618549862727273/
      ["#c71c0b", "#e05b11", "#ec9a4e", "#eabe7c", "#578382", "#024145"],
      // https://pinterest.com/pin/492649952993461/
      [
        "#CEA81F",
        "#D15C30",
        "#008F7D",
        "#AD4738",
        "#7D812C",
        "#032040",
        "#EAD3B1",
        "#5E190A",
      ],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);

    // extract a palette from the factory, sort by luminance
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const colors = this._palette_factory
      .getRandomPalette(this._xor128)
      .colors.sort((b, a) => a.l - b.l);

    this._bg_color = colors.shift();
    const palette = new Palette(colors);

    this._grid = new Grid(this.width, this._grid_cols);
    this._grid.setSeed(seed);
    this._grid.setSource(
      Math.floor(this._grid_cols / 2),
      Math.floor(this._grid_cols / 2),
    );
    this._grid.setNoiseDetails(
      this._grid_noise_scl,
      this._grid_noise_amplitude,
    );
    this._grid.setDestinationPalette(palette);

    for (let i = 0; i < this._destinations_num; i++) {
      while (true) {
        const rho =
          Math.floor(this._grid_cols / 2 - 1) * this._xor128.random(0.5, 1);
        const theta = this._xor128.random(0, 2 * Math.PI);
        const x = Math.floor(rho * Math.cos(theta) + this._grid_cols / 2);
        const y = Math.floor(rho * Math.sin(theta) + this._grid_cols / 2);

        if (!this._grid.hasDestination(x, y)) {
          this._grid.addDestination(x, y);
          break;
        }
      }
    }

    document.body.style.backgroundColor = this._bg_color.rgb;
  }

  draw() {
    this.noLoop();

    this.ctx.save();
    this.background(this._bg_color);
    this._grid.update();
    this._grid.show(this.ctx);
    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
