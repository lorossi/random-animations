import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { Palette, PaletteFactory } from "./palette-factory.js";
import { Rect, Barcode } from "./barcode.js";
import { QuestionMark } from "./questionmark.js";

class Sketch extends Engine {
  preload() {
    this._fg = Color.fromMonochrome(15);
    this._bg = Color.fromHex("#DBDBDB");
    this._lines_count = 10;
    this._scramble_rate = 0.5;
    this._scramble_radius = 2;
    this._scramble_noise_scl = 0.1;
  }

  setup() {
    this._seed = new Date().getTime();

    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e6));

    let lines = new Array(this._lines_count)
      .fill()
      .map(() => this._xor128.random_int(1, 4));
    const sum = lines.reduce((a, b) => a + b, 0);
    lines = lines.map((v) => (v / sum) * this.height);

    const noise_seed = this._xor128.random_int(1e6);

    this._barcodes = [];
    for (let i = 0, y = 0; i < lines.length; i++) {
      let last_x = 0;
      while (last_x < this.width) {
        const w = this._xor128.random(25, 750);
        const h = lines[i];
        const x = last_x;
        const random_seed = this._xor128.random_int(1e6);
        const barcode = new Barcode(
          new Rect(x, y, w, h),
          random_seed,
          noise_seed,
          this._fg
        );
        this._barcodes.push(barcode);
        last_x += w;
      }
      y += lines[i];
    }

    this._question_mark = new QuestionMark(
      this.width / 2,
      this.height / 2,
      this.height / 3,
      this._xor128.random_int(1e6)
    );

    document.body.style.background = this._bg.hex;
  }

  draw() {
    this.ctx.save();
    this.background(this._bg);

    this._barcodes.forEach((barcode) => {
      barcode.draw(this.ctx);
    });

    this._question_mark.draw(this.ctx);

    this._scramble();
    this.ctx.restore();

    this.noLoop();
  }

  _scramble() {
    const image_data = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = image_data.data;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const n = this._noise.noise(
          x * this._scramble_noise_scl,
          y * this._scramble_noise_scl
        );
        if ((n + 1) / 2 > this._scramble_rate) continue;

        const r = this._xor128.random_int(this._scramble_radius);
        const theta = this._xor128.random(Math.PI * 2);
        const dx = Math.floor(r * Math.cos(theta));
        const dy = Math.floor(r * Math.sin(theta));

        const x1 = Math.min(this.width - 1, Math.max(0, x + dx));
        const y1 = Math.min(this.height - 1, Math.max(0, y + dy));

        const index1 = (y * this.width + x) * 4;
        const index2 = (y1 * this.width + x1) * 4;

        for (let c = 0; c < 4; c++) {
          const temp = data[index1 + c];
          data[index1 + c] = data[index2 + c];
          data[index2 + c] = temp;
        }
      }
    }
    this.ctx.putImageData(image_data, 0, 0);
  }

  click() {
    this.setup();
    this.draw();
  }
}

export { Sketch };
