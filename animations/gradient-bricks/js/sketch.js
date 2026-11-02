import { Engine, Color, Utils, XOR128, PaletteFactory } from "./lib.js";
import { Row } from "./row.js";

class Sketch extends Engine {
  preload() {
    this._duration = 600;
    this._recording = false;

    this._gap = 4;
    this._sanzo_wada_palettes = [
      ["Coral Red", "White"],
      ["Helvetia Blue", "White"],
      ["Rosolanc Purple", "Pale King's Blue"],
      ["Grenadine Pink", "White"],
      ["Olympic Blue", "White"],
      ["Eosine Pink", "Sulphur Yellow"],
      ["Apricot Orange", "Pale Lemon Yellow"],
      ["Lilac", "Pale King's Blue"],
      ["Blue", "Seashell Pink"],
      ["Cerulian Blue", "Naples Yellow"],
      ["Light Mauve", "Nile Blue"],
      ["Blue Violet", "Sulphur Yellow"],
    ];
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    const palette_factory = PaletteFactory.fromSanzoWadaArray(
      this._sanzo_wada_palettes,
    );

    // keep the order, the second color is the background
    const palette = palette_factory.getRandomPalette(this._xor128, true);
    this._bg = palette.colors[1];

    this._rows_num = this._xor128.random_int(5, 10);

    const row_height =
      (this.height - this._gap * (this._rows_num - 1)) / this._rows_num;

    this._rows = Array(this._rows_num)
      .fill(null)
      .map((_, i) => {
        const y = i * (row_height + this._gap);
        return new Row(y, this.width, row_height, palette, this._xor128);
      });

    // each row slides by a whole period, alternating direction
    this._directions = this._rows.map((_, i) =>
      this._xor128.random_bool() ? 1 : -1,
    );

    document.body.style.background = this._bg.rgba;

    this._frame_offset = this.frame_count;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frame_count - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.background(this._bg);

    this._rows.forEach((r, i) => {
      // staggered start, each row moves for half of the loop
      const start = (i / this._rows_num) * 0.5;
      const rt = Utils.clamp((t - start) / 0.5, 0, 1);
      const eased = Utils.ease_in_out_poly(rt, 4);
      r.move(eased * this.width * this._directions[i]);
      r.show(this.ctx);
    });

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
