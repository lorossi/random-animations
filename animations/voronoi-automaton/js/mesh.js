import { Delaunay } from "./delaunay.js";

/** Clip a convex polygon against the half-plane closer to `a` than `b`. */
function clipHalfPlane(polygon, a, b) {
  // perpendicular bisector of a-b: points p with (p - mid) . (b - a) <= 0 are kept
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const dir = { x: b.x - a.x, y: b.y - a.y };

  const side = (p) => (p.x - mid.x) * dir.x + (p.y - mid.y) * dir.y;

  const output = [];
  for (let i = 0; i < polygon.length; i++) {
    const curr = polygon[i];
    const prev = polygon[(i + polygon.length - 1) % polygon.length];

    const curr_in = side(curr) <= 0;
    const prev_in = side(prev) <= 0;

    if (curr_in !== prev_in) {
      const s_prev = side(prev);
      const s_curr = side(curr);
      const t = s_prev / (s_prev - s_curr);
      output.push({
        x: prev.x + t * (curr.x - prev.x),
        y: prev.y + t * (curr.y - prev.y),
      });
    }
    if (curr_in) output.push(curr);
  }
  return output;
}

/**
 * Builds an irregular mesh (Voronoi cells over jittered sites) and exposes
 * the Delaunay-derived neighbor graph so a cellular automaton can run on it.
 */
class Mesh {
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} site_count
   * @param {XOR128} rand seeded random source
   */
  constructor(width, height, site_count, rand) {
    this._width = width;
    this._height = height;

    // jittered grid sampling gives more even spacing than pure random points
    const cols = Math.ceil(Math.sqrt((site_count * width) / height));
    const rows = Math.ceil(site_count / cols);
    const cell_w = width / cols;
    const cell_h = height / rows;

    this._sites = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const jitter_x = rand.random(0.15, 0.85);
        const jitter_y = rand.random(0.15, 0.85);
        this._sites.push({
          x: i * cell_w + jitter_x * cell_w,
          y: j * cell_h + jitter_y * cell_h,
        });
      }
    }

    const delaunay = new Delaunay(this._sites, width, height);
    this._neighbors = delaunay.neighbors;
    this._cells = this._buildCells();
  }

  _buildCells() {
    const bounding = [
      { x: 0, y: 0 },
      { x: this._width, y: 0 },
      { x: this._width, y: this._height },
      { x: 0, y: this._height },
    ];

    return this._sites.map((site, i) => {
      let polygon = bounding;
      for (const j of this._neighbors[i]) {
        polygon = clipHalfPlane(polygon, site, this._sites[j]);
        if (polygon.length === 0) break;
      }
      return polygon;
    });
  }

  get sites() {
    return this._sites;
  }

  get neighbors() {
    return this._neighbors;
  }

  get cells() {
    return this._cells;
  }

  get siteCount() {
    return this._sites.length;
  }
}

export { Mesh };
