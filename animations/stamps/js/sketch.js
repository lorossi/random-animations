import { Engine, Color } from "./engine.js";
import { PaintingFactory } from "./painting-factory.js";
import { Spinner } from "./spinner.js";
import { Stamp } from "./stamp.js";
import { XOR128 } from "./xor128.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.95;
    this._stamp_scl = 0.95;

    this._bg = Color.fromMonochrome(240);
    this._fg = Color.fromMonochrome(15);

    this._setupControls();
    this._loadPaintings();
  }

  setup() {
    this._seed = new Date().getTime();
    this._xor128 = new XOR128(this._seed);

    this._cols = this._xor128.random_int(8, 13);

    this._spinner = new Spinner(
      this.width / 2,
      this.height / 2,
      Math.min(this.width, this.height) / 3,
      this._fg
    );
    this._paintings.forEach((painting) => {
      painting.setXor128(this._xor128);
      painting.crop(this._cols);
    });

    this._stamps = new Array(this._cols * this._cols).fill().map((_, i) => {
      const x = (i % this._cols) * (this.width / this._cols);
      const y = Math.floor(i / this._cols) * (this.height / this._cols);
      const size = this.width / this._cols;
      return new Stamp(x, y, size, this._stamp_scl, this._xor128);
    });
  }

  draw() {
    this.ctx.save();
    this.background(this._bg);
    this.scaleFromCenter(this._scl);

    if (this._paintings_loaded) {
      this.noLoop();
      const fixed_painting = this._xor128.pick(this._paintings);
      const mixed_paintings = this._checkbox.checked;

      this._stamps.forEach((stamp, i) => {
        let painting;
        if (mixed_paintings) painting = this._xor128.pick(this._paintings);
        else painting = fixed_painting;
        stamp.show(this.ctx, painting, i);
      });
    } else {
      this.loop();

      this._spinner.update();
      this._spinner.show(this.ctx);

      this.ctx.fillStyle = this._fg.rgba;
      this.ctx.font = "100px Roboto";
      this.ctx.textAlign = "center";
      this.ctx.fillText("loading", this.width / 2, this.height / 2);
    }

    this.ctx.restore();
  }

  click() {
    this.setup();
    this.draw();
  }

  _setupControls() {
    // UI elements
    this._dropdown = document.querySelector("#artist-select");
    this._checkbox = document.querySelector("#mixed-paintings");

    PaintingFactory.getPaintingsList().forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.artist;
      option.textContent = entry.displayname;
      this._dropdown.appendChild(option);
    });

    // UI event listeners
    this._dropdown.addEventListener("change", () => {
      this._loadPaintings();

      this.setup();
      this.draw();
    });

    this._checkbox.addEventListener("change", () => {
      this.setup();
      this.draw();
    });
  }

  _loadPaintings() {
    this._paintings_loaded = false;
    this._paintings = PaintingFactory.loadAllPaintings(
      this._dropdown.value,
      this._loadedCallback.bind(this)
    );
  }

  _loadedCallback() {
    // check if all paintings are loaded
    this._paintings_loaded = this._paintings.every((p) => p.loaded);
    if (this._paintings_loaded) {
      this.setup();
      this.draw();
    }
  }
}

export { Sketch };
