import { Color } from "./engine.js";
import { Shelf } from "./shelf.js";

class Bookshelf {
  constructor(size, xor128, palette) {
    this._size = size;
    this._xor128 = xor128;
    this._palette = palette;

    this._generate();
  }

  _generate() {
    this._shelves_count = this._xor128.random_int(2, 6);
    this._shelf_thickness = 4;
    this._max_book_height = 92;

    this._generateShelves();
  }

  _shelvesOverlap(s1, s2, margin = 0) {
    return (
      s1.x + s1.w + margin > s2.x &&
      s1.x - margin < s2.x + s2.w &&
      s1.y + s1.h + margin > s2.y &&
      s1.y - margin < s2.y + s2.h
    );
  }

  _generateShelves(max_tries = 1000) {
    this._shelves = [];

    let placed = false;
    let tries = 0;
    while (tries < max_tries) {
      const w = this._xor128.random(0.25, 1) * this._size;
      const h = this._shelf_thickness;

      const x = this._xor128.random(this._size - w);
      const y = this._xor128.random(h, this._size - h);

      const shelf = new Shelf(
        x,
        y,
        w,
        h,
        this._max_book_height,
        this._xor128,
        this._palette
      );
      if (
        this._shelves.every(
          (s) => !this._shelvesOverlap(s, shelf, this._max_book_height * 2)
        )
      ) {
        this._shelves.push(shelf);
        placed = true;
      }
      tries++;
    }

    if (!placed) {
      console.log("Failed to place shelf");
    }
  }
  1;

  draw(ctx) {
    ctx.save();
    this._shelves.forEach((shelf) => shelf.show(ctx));
    ctx.restore();
  }
}

export { Bookshelf };
