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
    ];
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e16));
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);

    console.log(this._palette);
    this._cols = this._xor128.random_int(30, 50);
    this._rows = this._xor128.random_int(5, 15);

    const width = this.width / this._cols / this._spacing;
    const height = this.height / this._rows;

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
          this._palette,
          this._noise,
          this._noise_scl,
          this._color_scl,
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
