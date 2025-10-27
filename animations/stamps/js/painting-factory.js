import { Painting } from "./painting.js";

const PAINTINGS = [
  {
    artist: "magritte",
    displayname: "René Magritte",
    count: 6,
  },
  {
    artist: "kandinsky",
    displayname: "Wassily Kandinsky",
    count: 6,
  },
  {
    artist: "monet",
    displayname: "Claude Monet",
    count: 5,
  },
  {
    artist: "van-gogh",
    displayname: "Vincent van Gogh",
    count: 5,
  },
  {
    artist: "picasso",
    displayname: "Pablo Picasso",
    count: 5,
  },

  {
    artist: "caravaggio",
    displayname: "Caravaggio",
    count: 5,
  },
];

Object.freeze(PAINTINGS);

class PaintingFactory {
  static loadAllPaintings(artist, loaded_callback = null) {
    const entry = PAINTINGS.find((a) => a.artist === artist);
    if (!entry) {
      throw new Error(`Artist "${artist}" not found.`);
    }

    return new Array(entry.count)
      .fill()
      .map(
        (_, i) => new Painting(`paintings/${artist}/${i}.png`, loaded_callback)
      );
  }

  static getPaintingsList() {
    return PAINTINGS;
  }
}

export { PaintingFactory };
