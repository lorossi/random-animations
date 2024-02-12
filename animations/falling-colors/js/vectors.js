/**
 * Simple 2D and 3D vector library made in pure js.
 * @version 1.0.5
 * @author Lorenzo Rossi - https://www.lorenzoros.si - https://github.com/lorossi/
 * @license Attribution 4.0 International (CC BY 4.0)
 */

/**
 * Create a vector
 * @class
 * @param {number} [0] x - The x value
 * @param {number} [0] y - The y value
 * @param {number} [0] z - The z value
 * @return {Vector} - The new vector
 * @example
 * v1 = new Vector(1, 4, -3);
 * @example
 * v2 = new Vector(3, -5);
 */
class Vector {
  constructor(x = 0, y = 0, z = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
    return this;
  }

  /**
   * Add a vector
   * @param {Vector} v - The vector to be added
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a vector
   * @example
   * v1 = new Vector(1, -4, 12);
   * v2 = new Vector(2, 9, -3);
   * v1.add(v2);
   * // v1 = Vector(3, 5, 9);
   */
  add(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");

    this._x += v.x;
    this._y += v.y;
    this._z += v.z;
    return this;
  }

  /**
   * Subtract a vector
   * @param {Vector} v - The vector to be subtracted
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a vector
   * @example
   * v1 = new Vector(10, -3, 12);
   * v2 = new Vector(7, -8, 3);
   * v1.sub(v2);
   * // v1 = Vector(3, 5, 9);
   */
  sub(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");

    this._x -= v.x;
    this._y -= v.y;
    this._z -= v.z;
    return this;
  }

  /**
   * Alias for sub
   * @borrows subtract
   */
  subtract(v) {
    return this.sub(v);
  }

  /**
   * Multiply by a vector or a scalar
   * @param {Vector|number} v - The vector or scalar to be multiplied by
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a vector or a number
   * @example
   * v1 = new Vector(1, 2, 3);
   * v2 = new Vector(2, 5, 0);
   * v1.mult(v2);
   * // v1 = Vector(2, 10, 0);
   * @example
   * v1 = new Vector(7, 4, 2);
   * v1.mult(3);
   * // v1 = Vector(21, 12, 6);
   */
  mult(v) {
    if (v instanceof Vector) {
      this._x *= v.x;
      this._y *= v.y;
      this._z *= v.z;
      return this;
    } else if (typeof v === "number") {
      this._x *= v;
      this._y *= v;
      this._z *= v;
      return this;
    }

    throw new TypeError("The argument is not a vector or a number");
  }

  /**
   * Alias for mult
   * @borrows multiply
   */
  multiply(v) {
    return this.mult(v);
  }

  /**
   * Divide by a vector or a scalar
   * @param {Vector|number} v - The vector or scalar to be divided by
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a vector or a number
   * v1 = new Vector(4, 12, 9);
   * v2 = new Vector(4, 6, 3);
   * v1.divide(v2);
   * // v1 = Vector(1, 2, 3);
   * @example
   * v1 = new Vector(9, 3, 6);
   * v1.divide(3);
   * // v1 = Vector(3, 1, 2);
   */
  divide(v) {
    if (v instanceof Vector) {
      this._x /= v.x;
      this._y /= v.y;
      this._z /= v.z;
      return this;
    } else if (typeof v === "number") {
      this._x /= v;
      this._y /= v;
      this._z /= v;
      return this;
    }

    throw new TypeError("The argument is not a vector or a number");
  }

  /**
   * Alias for divide
   * @borrows divide
   */
  div(v) {
    return this.divide(v);
  }

  /**
   * Return minimum component of a vector
   * @return {number} The smallest component
   * @example
   * v1 = new Vector(3, -8, 12);
   * v1.min();
   * // -8
   */
  min() {
    return Math.min(this._x, this._y, this._z);
  }

  /**
   * Return maximum component of a vector
   * @return {number} The biggest component
   * @example
   * v1 = new Vector(3, -8, 12);
   * v1.max();
   * // -12
   */
  max() {
    return Math.max(this._x, this._y, this._z);
  }

  /**
   * Dot function
   * @param {Vector} v - The vector to perform dot operation with
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector(1, 4, 3);
   * v2 = new Vector(2, -6, 9);
   * v1.dot(v2);
   * // return 5;
   */
  dot(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");
    return this._x * v._x + this._y * v.y + this._z * v.z;
  }

  /**
   * Cross function
   * @param {Vector} v - The vector to perform cross operation with
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a vector
   * @example
   * v1 = new Vector(1, 4, 3);
   * v2 = new Vector(2, -6, 9);
   * v1.cross(v2);
   * // v1 = Vector(54, -3, -14);
   */
  cross(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");

    const x = this._y * v.z - this._z * v.y;
    const y = this._z * v._x - this._x * v.z;
    const z = this._x * v.y - this._y * v._x;

    this._x = x;
    this._y = y;
    this._z = z;
    return this;
  }

  /**
   * Square distance between vectors
   * @param {Vector} v - The vector whose distance will be calculated
   * @return {number} Return a number containing the square distance
   * @throws {TypeError} - If the argument is not a vector
   * @example
   * v1 = new Vector(1, 4, -3);
   * v2 = new Vector(6, -6, 7);
   * v1.distSq(v2);
   * // return 225
   */
  distSq(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");

    return (
      Math.pow(this._x - v._x, 2) +
      Math.pow(this._y - v.y, 2) +
      Math.pow(this._z - v.z, 2)
    );
  }

  /**
   * Distance between vectors
   * @param {Vector} v - The vector whose distance will be calculated
   * @return {number} Return a number containing the distance
   * @throws {TypeError} - If the argument is not a vector
   * @example
   * v1 = new Vector(1, 4, -3);
   * v2 = new Vector(6, -6, 7);
   * v1.dist(v2);
   * // return 15
   */
  dist(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");

    return Math.sqrt(this.distSq(v));
  }

  /**
   * Angle between vectors
   * @param {Vector} v - The vector whose contained angle will be calculated
   * @return {number} Return a vector containing the angle in radians
   * @throws {TypeError} - If the argument is not a vector
   * @example
   * v1 = new Vector(1, 4, -3);
   * v2 = new Vector(6, -6, 7);
   * v1.angleBetween(v2);
   * // return 1.0888019833827516
   */
  angleBetween(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");

    return Math.acos(this.dot(v) / (this.mag() * v.mag()));
  }

  /**
   * Check if two vectors are equals
   * @param {Vector} v - The vector that will be compared
   * @return {boolean} Return true or false
   * @throws {TypeError} - If the argument is not a vector
   * @example
   * v1 = new Vector(1, 4, -3);
   * v2 = new Vector(6, -6, 7);
   * v1.equals(v2);
   * // return false;
   */
  equals(v) {
    if (!(v instanceof Vector))
      throw new TypeError("The argument is not a vector");

    return this._x == v._x && this._y == v.y && this._z == v.z;
  }

  /**
   * Copy the vector into a new object
   * @return {Vector} The new copied vector
   * @example
   * v1 = new Vector(8, 144, -32);
   * v2 = v1.copy();
   * // v2 = Vector(8, 144, -32);
   */
  copy() {
    return new Vector(this._x, this._y, this._z);
  }

  /**
   * Limit the vector magnitude to a set value
   * @param {number} s - The maximum magnitude
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a number
   * @example
   * v1 = new Vector(2, 0, 2);
   * v1.limit(2);
   * // v1 = Vector(1.414213562373095, 0, 1.414213562373095);
   */
  limit(s) {
    if (typeof s !== "number")
      throw new TypeError("The argument is not a number");

    let m = this.mag();
    if (m > s) {
      this.multiply(s / m);
      return this;
    }
  }

  /**
   * Set the vector magnitude
   * @param {number} s - Magnitude
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a number
   * @example
   * v1 = new Vector(2, 0, 2);
   * v1.setMag(4);
   * // v1 = Vector(2.82842712474619, 0, 2.82842712474619);
   */
  setMag(s) {
    if (typeof s !== "number")
      throw new TypeError("The argument is not a number");

    let m = this.mag();
    this.multiply(s / m);
    return this;
  }

  /**
   * Rotate a vector by an angle in radians
   * @param {number} t - The rotation angle
   * @return {Vector} - The new vector
   * @throws {TypeError} - If the argument is not a number
   * @example
   * v1 = new Vector(2, 1);
   * v1.rotate(Math.PI);
   * // v1 = Vector(-2, -1, 0);
   */
  rotate(t) {
    if (typeof t !== "number")
      throw new TypeError("The argument is not a number");

    let x = Math.cos(t) * this._x - Math.sin(t) * this._y;
    let y = Math.sin(t) * this._x + Math.cos(t) * this._y;
    this._x = x;
    this._y = y;
    return this;
  }

  /**
   * Normalize a vector (its magnitude will be unitary)
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector(5, 2, -4);
   * v1.normalize();
   * // v1 = Vector(0.7453559924999299, 0.29814239699997197, -0.5962847939999439);
   */
  normalize() {
    this.divide(this.mag());
    return this;
  }

  /**
   * Invert some (or all) components of the vector
   * @param {boolean} x - The x component
   * @param {boolean} y - The y component
   * @param {boolean} z - The z component
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector(4, -5, 7);
   * v1.invert(true, true, true);
   * // v1 = Vector(-4, 5, -7);
   * @example
   * v2 = new Vector(4, -1, -3);
   * v2.invert(true, false);
   * // v2 = Vector(-4, -1, -3);
   * @example
   * v3 = new Vector(4, -1, -3);
   * v3.invert();
   * // v3 = Vector(-4, 1, 3);
   */
  invert(x, y, z) {
    if (x === true) {
      this._x *= -1;
    }
    if (y === true) {
      this._y *= -1;
    }
    if (z === true) {
      this._z *= -1;
    }

    if (x === undefined && y === undefined && z === undefined) {
      this._x *= -1;
      this._y *= -1;
      this._z *= -1;
    }

    return this;
  }

  /**
   * Invert the x component of the vector
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector(4, -5, 7);
   * v1.invertX();
   * // v1 = Vector(-4, -5, 7);
   */
  invertX() {
    this.invert(true, false, false);
    return this;
  }

  /**
   * Invert the y component of the vector
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector(4, -5, 7);
   * v1.invertY();
   * // v1 = Vector(4, 5, 7);
   */
  invertY() {
    this.invert(false, true, false);
    return this;
  }

  /**
   * Invert the z component of the vector
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector(4, -5, 7);
   * v1.invertZ();
   * // v1 = Vector(4, -5, -7);
   */
  invertZ() {
    this.invert(false, false, true);
    return this;
  }

  /**
   * Calculate the vector magnitude
   * @return {number} - The vector magnitude
   * @example
   * v1 = new Vector(6, -2, -1);
   * v1.mag();
   * // return 6.4031242374328485;
   */
  mag() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
  }

  /**
   * Alias for mag()
   * @borrows mag
   */
  magnitude() {
    return this.mag();
  }

  /**
   * Calculate the vector square magnitude
   * @return {number} The vector square magnitude
   * @example
   * v1 = new Vector(6, -2, -1);
   * v1.magSq();
   * // return 41;
   */
  magSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z;
  }

  /**
   * Alias for magSq()
   * @borrows magSq
   */
  magnitudeSq() {
    return this.magSq();
  }

  /**
   * Calculate the vector heading (radians) - only for 2D vectors
   * @return {number} The vector heading (radians)
   * @example
   * v1 = new Vector(3, 3);
   * v1.heading2D();
   * // return 0.7853981633974483
   */
  heading2D() {
    if (this._z !== 0) throw new Error("The vector is not 2D");

    return Math.atan2(this._y, this._x);
  }

  /**
   * Return a printable string of the vector
   * @return {string} Printable string
   * @example
   * v1 = new Vector(3, 3, -4);
   * v1.toString();
   * // return "x: 3, y: 3, z: -4"
   */
  toString() {
    return `Vector(${this._x}, ${this._y}, ${this._z})`;
  }

  /**
   * Return an array with the vector components
   * @return {array} Array with the vector components
   * @example
   * v1 = new Vector(3, 3, -4);
   * v1.toArray();
   * // return [3, 3, -4]
   */
  toArray() {
    return [this._x, this._y, this._z];
  }

  /**
   * Return an object with the vector components
   * @return {object} Object with the vector components
   * @example
   * v1 = new Vector(3, 3, -4);
   * v1.toObject();
   * // return { x: 3, y: 3, z: -4 }
   */
  toObject() {
    return { x: this._x, y: this._y, z: this._z };
  }

  /**
   * Create a 2D vector from its angle
   * @static
   * @param {number} [0] theta - Theta angle (radians)
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector.fromAngle2D(2.42);
   * // v1 = Vector(-0.7507546047254909,0.6605812012792007, 0);
   */
  static fromAngle2D(theta = 0) {
    return new Vector(Math.cos(theta), Math.sin(theta), 0);
  }

  /**
   * Create a 3D vector from its angles
   * @static
   * @param {number} [0] theta - Theta angle (radians)
   * @param {number} [0] phi - Phi angle (radians)
   * @return {Vector} - The new vector
   * @example
   * v1 = new Vector.fromAngle2D(1.33, -2.44);
   * // v1 = Vector(-0.1821516349441893, -0.6454349983343708, -0.7417778945292652);
   */
  static fromAngle3D(theta = 0, phi = 0) {
    return new Vector(
      Math.cos(theta) * Math.cos(phi),
      Math.sin(phi),
      Math.sin(theta) * Math.cos(phi)
    );
  }

  /**
   * Create a random 2D vector
   * @return {Vector} - The new vector
   * @static
   * @example
   * v1 = new Vector.random2D();
   * // v1 = Vector(0.2090564102081952, -0.977903582849998, 0);
   */
  static random2D() {
    let theta = Math.random() * 2 * Math.PI;
    return Vector.fromAngle2D(theta);
  }

  /**
   * Create a random 3D vector
   * @return {Vector} - The new vector
   * @static
   * @example
   * v1 = new Vector.random3D();
   * // v1 = Vector(-0.7651693875628326, -0.43066633476756877, 0.47858365667309205);
   */
  static random3D() {
    let theta = Math.random() * 2 * Math.PI;
    let phi = Math.random() * 2 * Math.PI;
    return Vector.fromAngle3D(theta, phi);
  }

  /**
   * Create a vector from an Array
   * @param {Array} a - The array
   * @return {Vector} - The new vector
   * @static
   * @example
   * // return Vector(4, 5, 6)
   * v = new Vector.fromArray([4, 5, 6])
   * @example
   * // return Vector(1, 7, 0)
   * v = new Vector.fromArray([1, 7])
   */
  static fromArray(a) {
    a = a.fill(0, 3);
    return new Vector(a[0], a[1], a[2]);
  }

  /**
   * Create a vector from an object
   * @return {Vector} - The new vector
   * @static
   * @example
   * // return Vector(1, 5, 9)
   * v = new Vector.fromArray([1, 5, 9]])
   * @example
   * // return Vector(3, 0, 4)
   * v = new Vector.fromArray([3, 0, 4]])
   */
  static fromObject(o) {
    return new Vector(o.x, o.y, o.z);
  }

  /**
   * Create a vector from its polar coordinates
   * @param {number} r - The radius
   * @param {number} theta - The theta angle (radians)
   * @param {number} [0] phi - The phi angle (radians)
   * @return {Vector} - The new vector
   * @throws {Error} If the arguments are not numbers
   * @static
   */
  static fromPolar(r, theta, phi = 0) {
    if (r < 0) throw new Error("The radius must be positive");

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    return new Vector(x, y, z);
  }

  /**
   * Create a vector from a string
   * @param {string} s - The string
   * @return {Vector} - The new vector
   * @static
   * @throws {Error} If the string is not in the correct format
   *
   */
  static fromString(s) {
    const groups = s.match(/Vector\(([\s,0-9.-]+)\)/);
    try {
      const v = groups[1].split(",").fill(0, 3);
      return new Vector(parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2]));
    } catch (e) {
      throw new Error("The string is not in the correct format");
    }
  }

  /**
   * Get the x component of the vector
   * @return {number} The x component
   */
  get x() {
    return this._x;
  }

  /**
   * Set the x component of the vector
   * @param {number} nx - The new x component
   */
  set x(nx) {
    this._x = nx;
  }

  /**
   * Get the y component of the vector
   * @return {number} The y component
   */
  get y() {
    return this._y;
  }

  /**
   * Set the y component of the vector
   * @param {number} ny - The new y component
   */
  set y(ny) {
    this._y = ny;
  }

  /**
   * Get the z component of the vector
   * @return {number} The z component
   */
  get z() {
    return this._z;
  }

  /**
   * Set the z component of the vector
   * @param {number} nz - The new z component
   */
  set z(nz) {
    this._z = nz;
  }
}

export { Vector };
