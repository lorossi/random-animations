class Painting {
  constructor(source, loaded_callback = null) {
    this._source = source;

    this._img = new Image();
    this._img.src = this._source;
    this._crops = [];

    this._loaded = false;
    this._img.onload = () => {
      this._loaded = true;
      if (loaded_callback) loaded_callback(this);
    };
  }

  setXor128(xor128) {
    this._xor128 = xor128;
  }

  crop(elements) {
    this._crops = [];
    const crop_size = Math.floor(
      Math.min(this._img.width / elements, this._img.height / elements)
    );
    const x_border = this._img.width - crop_size * elements;
    const y_border = this._img.height - crop_size * elements;

    // randomly offset the cropping area within the image borders
    const x_offset = this._xor128.random_int(x_border + 1);
    const y_offset = this._xor128.random_int(y_border + 1);

    for (let y = 0; y < elements; y++) {
      for (let x = 0; x < elements; x++) {
        this._crops.push({
          x: x * crop_size + x_offset,
          y: y * crop_size + y_offset,
          size: crop_size,
        });
      }
    }

    this._crops = this._xor128.shuffle(this._crops);
  }

  drawCrop(ctx, index, size) {
    if (this._crops.length === 0 || !this._loaded) return;

    const crop = this._crops[index % this._crops.length];

    ctx.save();
    ctx.drawImage(
      this._img,
      crop.x,
      crop.y,
      crop.size,
      crop.size,
      0,
      0,
      size,
      size
    );

    ctx.restore();
  }

  get loaded() {
    return this._loaded;
  }
}

export { Painting };
