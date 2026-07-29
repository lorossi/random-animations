/**
 * Minimal Bowyer-Watson Delaunay triangulation.
 * Only used to extract the neighbor graph between sites (not for rendering),
 * so triangle quality/perf beyond "correct" is not a concern here.
 */
class Delaunay {
  /**
   * @param {Array<{x:number,y:number}>} points sites to triangulate
   * @param {number} width bounding width
   * @param {number} height bounding height
   */
  constructor(points, width, height) {
    this._points = points;
    this._width = width;
    this._height = height;
    this._triangulate();
  }

  _superTriangle() {
    const m = Math.max(this._width, this._height) * 10;
    return [
      { x: -m, y: -m },
      { x: m * 2, y: -m },
      { x: -m, y: m * 2 },
    ];
  }

  _circumcircle(a, b, c) {
    const ax = a.x,
      ay = a.y,
      bx = b.x,
      by = b.y,
      cx = c.x,
      cy = c.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < 1e-9) return null;

    const ux =
      ((ax * ax + ay * ay) * (by - cy) +
        (bx * bx + by * by) * (cy - ay) +
        (cx * cx + cy * cy) * (ay - by)) /
      d;
    const uy =
      ((ax * ax + ay * ay) * (cx - bx) +
        (bx * bx + by * by) * (ax - cx) +
        (cx * cx + cy * cy) * (bx - ax)) /
      d;

    const r = Math.hypot(ax - ux, ay - uy);
    return { x: ux, y: uy, r };
  }

  _triangulate() {
    const super_pts = this._superTriangle();
    const all_pts = [...super_pts, ...this._points];

    // triangles stored as index triples into all_pts
    let triangles = [[0, 1, 2]];

    for (let i = 0; i < this._points.length; i++) {
      const p_index = super_pts.length + i;
      const p = all_pts[p_index];

      const bad_triangles = [];
      for (const tri of triangles) {
        const [ia, ib, ic] = tri;
        const circle = this._circumcircle(
          all_pts[ia],
          all_pts[ib],
          all_pts[ic],
        );
        if (circle && Math.hypot(p.x - circle.x, p.y - circle.y) < circle.r) {
          bad_triangles.push(tri);
        }
      }

      // find boundary of the polygonal hole
      const edge_count = new Map();
      const edgeKey = (u, v) => (u < v ? `${u}_${v}` : `${v}_${u}`);

      for (const [ia, ib, ic] of bad_triangles) {
        for (const [u, v] of [
          [ia, ib],
          [ib, ic],
          [ic, ia],
        ]) {
          const key = edgeKey(u, v);
          edge_count.set(key, (edge_count.get(key) || 0) + 1);
        }
      }

      const boundary = [];
      for (const [ia, ib, ic] of bad_triangles) {
        for (const [u, v] of [
          [ia, ib],
          [ib, ic],
          [ic, ia],
        ]) {
          if (edge_count.get(edgeKey(u, v)) === 1) boundary.push([u, v]);
        }
      }

      // remove bad triangles, re-triangulate hole with new point
      triangles = triangles.filter((tri) => !bad_triangles.includes(tri));
      for (const [u, v] of boundary) {
        triangles.push([u, v, p_index]);
      }
    }

    // discard triangles touching the super triangle
    triangles = triangles.filter(
      ([ia, ib, ic]) =>
        ia >= super_pts.length &&
        ib >= super_pts.length &&
        ic >= super_pts.length,
    );

    // build neighbor graph, indices relative to this._points (site indices)
    const offset = super_pts.length;
    const neighbors = this._points.map(() => new Set());

    for (const [ia, ib, ic] of triangles) {
      const a = ia - offset,
        b = ib - offset,
        c = ic - offset;
      neighbors[a].add(b);
      neighbors[a].add(c);
      neighbors[b].add(a);
      neighbors[b].add(c);
      neighbors[c].add(a);
      neighbors[c].add(b);
    }

    this._neighbors = neighbors.map((set) => [...set]);
    this._triangles = triangles.map(([ia, ib, ic]) => [
      ia - offset,
      ib - offset,
      ic - offset,
    ]);
  }

  /** @returns {Array<Array<number>>} neighbor site indices for each site */
  get neighbors() {
    return this._neighbors;
  }

  /** @returns {Array<Array<number>>} triangles as site-index triples */
  get triangles() {
    return this._triangles;
  }
}

export { Delaunay };
