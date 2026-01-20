import {
  Color,
  Engine,
  GradientPalette,
  Palette,
  PaletteFactory,
  Point,
  SimplexNoise,
  XOR128,
} from "./lib.js";

import { Plane } from "./plane.js";
import { Texture } from "./texture.js";

class Sketch extends Engine {
  preload() {
    this._hex_palettes = [
      ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"],
      ["#011627", "#FDFFFC", "#2EC4B6", "#E71D36", "#FF9F1C"],
      ["#006BA6", "#0496FF", "#FFBC42", "#D81159", "#8F2D56"],
      ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
      ["#05668D", "#028090", "#00A896", "#02C39A", "#F0F3BD"],
      ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
      ["#EDAE49", "#D1495B", "#00798C", "#30638E", "#003D5B"],
    ];
    this._plane_slots_num = 500;
    this._texture_scl = 4;
    this._texture_oversize = 1.1;

    this._duration = 600;
    this._recording = false;
  }

  setup() {
    this._seed = new Date().getTime();

    this._xor128 = new XOR128(this._seed);
    this._noise = new SimplexNoise(this._xor128.random_int(1e9));

    this._noise_scl = this._xor128.random(0.001, 0.01);
    this._time_scl = this._xor128.random(0.5, 2.0);

    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_palettes);
    this._palette = this._palette_factory.getRandomPalette(this._xor128);
    [this._bg, ...this._colors] = this._palette.colors;

    this._planes_num = this._xor128.random_int(4, 8);
    this._plane_height = (this.height / this._planes_num) * 3;

    this._planes = new Array(this._planes_num).fill().map((_, i) => {
      const color = this._colors[i % this._colors.length];
      return new Plane(
        this.width,
        this.height,
        this._plane_height,
        this._plane_slots_num,
        i,
        this._planes_num,
        color,
      );
    });

    this._texture = new Texture(
      this.width * this._texture_oversize,
      this._texture_scl,
      this._xor128,
    );

    this._rotation = this._xor128.random_int(4) * (Math.PI / 2);

    document.body.style.background = this._bg.rgba;
    this._frame_offset = this.frameCount;
    if (this._recording) {
      this.startRecording();
      console.log("%cRecording started", "color:green");
    }
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    const theta = t * Math.PI * 2;
    const tx = ((1 + Math.cos(theta)) / 2) * this._time_scl;
    const ty = ((1 + Math.sin(theta)) / 2) * this._time_scl;

    const noises = new Array(this._plane_slots_num).fill(0).map((_, i) => {
      const xx = (i / this._plane_slots_num) * this.width * this._noise_scl;
      return (this._noise.noise(xx, tx, ty) + 1) / 2;
    });

    this.ctx.save();
    this.background(this._bg);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.rotate(this._rotation);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this._planes.forEach((plane) => {
      plane.update(t, noises);
      plane.draw(this.ctx);
    });

    this._texture.draw(this.ctx);

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
