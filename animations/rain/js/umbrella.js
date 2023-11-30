import { Vector } from "./vectors.js";
import { Color } from "./engine.js";

class Umbrella {
  constructor(x, y, size) {
    this._pos = new Vector(x, y);
    this._size = size;
    this._r = this._size / 2;
    this._semi_circles = 4;
    this._handle_w = 8;

    this._color = Color.fromMonochrome(15);
    this._elasticity = 0.8;
  }

  setColor(color) {
    this._color = color;
  }

  setElasticity(elasticity) {
    this._elasticity = elasticity;
  }

  getNormal(x) {
    // intersect x with circle
    // x**2 + y**2 = r**2 => y = sqrt(r**2 - x**2)
    const y = Math.sqrt(this._r ** 2 - (x - this._pos.x) ** 2);
    const normal = new Vector(x, y);
    return normal.sub(this._pos).normalize();
  }

  distance(drop) {
    if (drop.y > this._pos.y) return [false, null];
    if (drop.x < this._pos.x - this._r) [false, null];
    if (drop.x > this._pos.x + this._r) [false, null];

    return [true, drop.pos.copy().sub(this._pos)];
  }

  repel(drop, direction) {
    const p = drop.pos
      .copy()
      .sub(direction.copy().setMag(direction.mag() - this._r));
    drop.setPos(p);
  }

  addForce(drop, direction) {
    const f = direction.copy().setMag(0.5);
    const p = direction.copy().setMag(3);

    const pos = drop.pos.copy().add(p);

    drop.applyForce(f);
    drop.setPos(pos);
  }

  bounce(drop) {
    // reflect = v - 2 * (v . n) * n
    const [collide, direction] = this.distance(drop);
    if (!collide) return;
    if (direction.mag() > this._r) return;

    if (direction.mag() <= this._r) this.repel(drop, direction);
    if (drop.vel.mag() < 0.1) this.addForce(drop, direction);

    const n = this.getNormal(drop.x);
    const fact = n.copy().mult(-2 * drop.vel.copy().dot(n));
    const reflect = drop.vel.copy().add(fact).mult(this._elasticity);
    drop.setVel(reflect);
  }

  show(ctx) {
    // the umbrella is composed of a semi-circle and a handle made of a line
    // the center of the umbrella is the center of the semi-circle
    const w = this._r / this._semi_circles;
    const h = w * 0.75;

    ctx.save();
    ctx.fillStyle = this._color.rgba;
    ctx.strokeStyle = this._color.rgba;
    ctx.translate(this._pos.x, this._pos.y);

    ctx.save();
    // create clipping mask
    const clip = new Path2D();
    ctx.beginPath();

    clip.arc(0, 0, this._r, Math.PI, 0);

    for (let i = 0; i < this._semi_circles; i++) {
      const x = -this._size / 2 + i * w * 2 + w;
      clip.ellipse(x, 0, w, h, 0, Math.PI, 0, false);
    }

    clip.closePath();
    ctx.clip(clip, "evenodd");

    ctx.fillRect(-this._size / 2, -this._size / 2, this._size, this._size);
    ctx.restore();

    ctx.lineWidth = this._handle_w;

    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(0, this._r);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(h, this._r, h, 0, Math.PI);
    ctx.stroke();

    ctx.restore();

    // ctx.save();
    // ctx.fillStyle = "red";
    // ctx.translate(this._pos.x, this._pos.y);
    // ctx.beginPath();
    // ctx.arc(0, 0, 2, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.restore();
  }

  get x() {
    return this._pos.x;
  }

  get y() {
    return this._pos.y;
  }
}

export { Umbrella };
