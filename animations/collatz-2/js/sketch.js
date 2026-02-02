import { Color, Engine, PaletteFactory, XOR128 } from "./lib.js";
import { Collatz } from "./collatz.js";

class Sketch extends Engine {
  preload() {
    this._bg = Color.fromMonochrome(15);
    this._hex_arrays = [
      ["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"],
      ["#4A4A4A", "#F7F7F7"],
      ["#BCE784", "#5DD39E", "#348AA7", "#525174", "#513B56"],
      ["#355070", "#6D597A", "#B56576", "#E56B6F", "#EAAC8B"],
      ["#22577A", "#38A3A5", "#57CC99", "#80ED99", "#C7F9CC"],
      ["#EDAE49", "#D1495B", "#00798C", "#30638E", "#003D5B"],
    ];
    this._min_n = 10000;
    this._max_n = 20000;
    this._sequences_num = 1000;
    this._step_len = 5;
    this._start_angle = -Math.PI / 2;
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);
    this._palette_factory = PaletteFactory.fromHEXArray(this._hex_arrays);
    this._palette = this._palette_factory.getRandomPalette(this._xor128, false);
    this._delta_angle = Math.PI / this._xor128.random_int(8, 64);
    this._rotation = this._xor128.random_int(4) * (Math.PI / 2);
    this._scale = new Array(2).fill(0).map(() => this._xor128.pick([-1, 1]));

    this._n = this._min_n;
    this._sequences = new Array();

    this.background(this._bg);
    document.body.style.background = this._bg.hex;
  }

  draw(dt) {
    const delta_frame = this.frameCount - this._frame_offset;
    const t = (delta_frame / this._duration) % 1;

    this.ctx.save();

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scale[0], this._scale[1]);
    this.ctx.rotate(this._rotation);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    this.ctx.translate(this.width * 0.15, this.height);

    this._sequences.forEach((seq) => {
      seq.step();
      seq.show(this.ctx);
    });

    this.ctx.restore();

    this._sequences = this._sequences.filter((seq) => !seq.ended);
    if (this._sequences.length < this._sequences_num && this._n < this._max_n) {
      for (let i = 0; i < this._sequences_num - this._sequences.length; i++) {
        this._sequences.push(
          new Collatz(
            this._n,
            this._step_len,
            this._start_angle,
            this._delta_angle,
            this._palette,
          ),
        );
        this._n++;
      }
    } else if (this._sequences.length == 0) {
      console.log("animation ended");
      this.noLoop();
    }
  }

  click() {
    this.setup();
    this.loop();
  }
}

export { Sketch };
