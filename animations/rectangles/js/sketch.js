import { Engine } from "./lib.js";

import { Color, SimplexNoise, Utils, XOR128, PaletteFactory } from "./lib.js";

import { Rectangle } from "./rectangle.js";

class Sketch extends Engine {
  preload() {
    this._duration = 900;
    this._recording = false;

    this._noise_radius = 0.5;
    this._noise_scl = 0.1;
    this._color_scl = 0.00075;
    this._scl = 0.9;
    this._spacing = 2;

    this._bg = Color.fromMonochrome(15);
    this._shadow = Color.fromMonochrome(240);

    this._hex_palettes = [
      [
        "#f94144",
        "#f3722c",
        "#f8961e",
        "#f9c74f",
        "#90be6d",
        "#43aa8b",
        "#577590",
      ],
      ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"],
      ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
      ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
      ["#390099", "#9e0059", "#ff0054", "#ff5400", "#ffbd00"],
      ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
      ["#1f2041", "#4b3f72", "#ffc857", "#119da4", "#19647e"],
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);

    this._cols = this._xor128.random_int(30, 50);
    this._rows = this._xor128.random_int(5, 15);

    const width = this.width / this._cols / this._spacing;
    const height = this.height / this._rows;
    const shadow_x = width / this._xor128.random_int(2, 5);
    const shadow_y = height / this._xor128.random_int(10, 20);

    const rectangle_params = {
      palette: this._palette,
      noise: this._noise,
      noise_scl: this._noise_scl,
      color_scl: this._color_scl,
      shadow: this._shadow,
      shadow_x,
      shadow_y,
    };

    this._rectangles = Array.from(
      { length: this._cols * this._rows },
      (_, i) => {
        const [col, row] = Utils.i_to_xy(i, this._cols);
        const dx = row % 2 === 0 ? 0 : width;

        return new Rectangle(
          col * width * this._spacing + dx,
          row * height,
          width,
          height,
          rectangle_params,
        );
      },
    );

    document.body.style.backgroundColor = this._bg.hex;

    this._frame_offset = this.frame_count;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frame_count - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;
    const theta = t * Math.PI * 2;
    const tx = this._noise_radius * Math.cos(theta);
    const ty = this._noise_radius * Math.sin(theta);

    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    this._rectangles.forEach((rectangle) => {
      rectangle.update(tx, ty);
      rectangle.show(this.ctx);
    });

    this.ctx.restore();

    if (t == 0 && delta_frame > 0 && this._recording) {
      this._recording = false;
      this.stopRecording();
      console.log("%cRecording stopped. Saving...", "color:yellow");
      this.saveRecording();
      console.log("%cRecording saved", "color:green");
    }
  }

  click() {
    this.setup();
  }
}

export { Sketch };
