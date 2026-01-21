import {
  Engine,
  SimplexNoise,
  XOR128,
  Color,
  Palette,
  PaletteFactory,
} from "./lib.js";
import { Grid } from "./grid.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._cols = 50;
    this._noise_scl = [0.1, 0.0005];
    this._disruption_scl = [0.015, 0.08];
    this._distruption_threshold = 0.25;
    this._shuffle_chance = 0.1;
    this._shuffle_radius = 8;

    this._hex_palettes = [
      ["#D92555", "#75AABF", "#024959", "#011F26", "#F2380F"],
      ["#5F49F2", "#527AF2", "#F2B807", "#F28907", "#F2220F"],
      ["#034AA6", "#0367A6", "#ADD4D9", "#F29544", "#D95204"],
      ["#E81A0A", "#FFCC1C", "#1C33FF", "#E86F19", "#B400FF"],
      ["#025159", "#F2D479", "#D9BB84", "#F27141", "#8C3D2B"],
      ["#FFA622", "#000000", "#D4591C", "#A6A6A6", "#383838"],
    ];
    this._texture_scl = 4;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e6));

    const palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    const palette = palette_factory.getRandomPalette(this._xor128, true);
    const dc = this._xor128.random_int(0, 32);
    const disruption_palette = new Palette([
      Color.fromMonochrome(dc),
      Color.fromMonochrome(255 - dc),
    ]);
    const grid_seed = this._xor128.random_int(1e6);
    const texture_seed = this._xor128.random_int(1e6);

    const options = {
      palette,
      disruption_palette,
      seed: grid_seed,
      noise_scl: this._noise_scl,
      disruption_scl: this._disruption_scl,
      distruption_threshold: this._distruption_threshold,
      shuffle_chance: this._shuffle_chance,
      shuffle_radius: this._shuffle_radius,
    };

    this._grid = new Grid(this._cols, this.width, options);
    this._texture = new Texture(this.width, this._texture_scl, texture_seed);
    this._bg = this._grid.getDominantColor();

    document.body.style.background = this._bg.hex;

    this._font_loaded = false;
    document.fonts
      .load("10pt RobotoBold")
      .then(() => (this._font_loaded = true));
  }

  draw() {
    if (!this._font_loaded) return;

    this.ctx.save();

    this.ctx.save();
    this.background(this._bg);
    this._grid.draw(this.ctx);
    this._texture.draw(this.ctx);
    this.ctx.restore();

    this._drawQuestionMark(this.ctx, this._cols - 2, this._cols - 1, Math.PI);
    this._drawQuestionMark(this.ctx, this._cols - 1, this._cols - 1);

    this.ctx.restore();
    this.noLoop();
  }

  click() {
    this.setup();
    this.loop();
  }

  _drawQuestionMark(ctx, x, y, rotation) {
    const cell_scl = this.width / this._cols;
    const font_size = Math.floor(cell_scl);
    const color = this._grid.getColor(x, y);

    ctx.save();
    ctx.translate(cell_scl * (x + 0.5), cell_scl * (y + 0.5));
    ctx.fillStyle = this._isColorDark(color) ? "#FFFFFF" : "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${font_size}px RobotoBold`;
    ctx.rotate(rotation);
    ctx.fillText("?", 0, 0.1 * cell_scl);
    ctx.restore();
  }
  _isColorDark(color) {
    const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    return luminance < 128;
  }
}

export { Sketch };
