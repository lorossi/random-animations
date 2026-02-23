import { Color, Utils } from "./lib.js";

class MaxHeap {
  constructor() {
    this._heap = [];
    this._snapshots = [];
    this._max_value = 0;
  }

  static from_array(arr) {
    const heap = new MaxHeap();
    arr.forEach((x) => heap.insert(x));
    return heap;
  }

  insert(value) {
    this._max_value = Math.max(this._max_value, value);
    this._save_snapshot();
    this._heap.push(value);
    this._heapify_up(this._heap.length - 1);
  }

  pop() {
    if (this._heap.length === 0) return null;

    this._save_snapshot();
    const max_value = this._heap[0];
    const last_value = this._heap.pop();

    if (this._heap.length > 0) {
      this._heap[0] = last_value;
      this._heapify_down(0);
    }

    return max_value;
  }

  _heapify_up(i) {
    if (i === 0) return;

    const parent = this._parent(i);
    if (this._heap[i] > this._heap[parent]) {
      this._swap(i, parent);
      this._heapify_up(parent);
    }
  }

  _heapify_down(i) {
    const size = this._heap.length;

    const l = this._left(i);
    const r = this._right(i);
    let largest = i;

    if (l < size && this._heap[l] > this._heap[largest]) {
      largest = l;
    }

    if (r < size && this._heap[r] > this._heap[largest]) {
      largest = r;
    }

    if (largest !== i) {
      this._swap(i, largest);
      this._heapify_down(largest);
    }
  }

  _left(i) {
    return 2 * i + 1;
  }

  _right(i) {
    return 2 * i + 2;
  }

  _swap(i, j) {
    this._save_snapshot();
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    this._save_snapshot();
  }

  _parent(i) {
    return Math.floor((i - 1) / 2);
  }

  _save_snapshot() {
    const new_snapshot = [...this._heap];
    if (this._snapshots.length > 0) {
      const last_snapshot = this._snapshots[this._snapshots.length - 1];
      if (
        last_snapshot.length === new_snapshot.length &&
        last_snapshot.every((value, index) => value === new_snapshot[index])
      ) {
        return;
      }
    }

    this._snapshots.push(new_snapshot);
  }

  *snapshots() {
    for (const snapshot of this._snapshots) {
      yield snapshot;
    }
  }

  shift_snapshot() {
    return this._snapshots.shift();
  }

  get height() {
    return Math.ceil(Math.log2(this._heap.length + 1)) - 1;
  }

  get width() {
    return 2 ** this.height;
  }

  get length() {
    return this._heap.length;
  }

  get max_value() {
    return this._max_value;
  }
}

class VisualMaxHeap extends MaxHeap {
  constructor(max_size) {
    super();
    this._max_size = max_size; // for visualization purposes
  }

  static from_array(arr) {
    const heap = new VisualMaxHeap(arr.length);
    arr.forEach((x) => heap.insert(x));
    return heap;
  }

  insert(value) {
    super.insert(value);
  }

  show(ctx) {
    if (this._heap.length === 0) return;

    const latest_snap =
      this._snapshots.length > 0 ? this.shift_snapshot() : this._heap;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const base_size =
      Math.min(width, height) / Math.min(this.height, this.width) / 2;
    let level = 0;

    ctx.save();
    ctx.translate(base_size / 2, base_size / 2);
    latest_snap.forEach((value, index) => {
      const x = (index - (2 ** level - 1)) * (width / 2 ** level);
      const y = level * (height / (this.height + 1));

      const size = base_size * (0.5 + 0.5 * (value / this.max_value));

      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${(value / this.max_value) * 360}, 80%, 60%)`;
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (index === 2 ** (level + 1) - 2) {
        level++;
      }
    });
    ctx.restore();
  }

  get finished() {
    return this._snapshots.length === 0;
  }
}

export { MaxHeap, VisualMaxHeap };
