import { Color, Point, Utils } from "./lib.js";

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
    this._save_snapshot();
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
  constructor(max_size, step_duration = 30) {
    super();
    this._max_size = max_size; // for visualization purposes
    this._step_duration = step_duration; // frames per snapshot transition

    this._prev_snap = [];
    this._curr_snap = [];
    this._changed_indices = new Set();
    this._step_frame = 0;

    this._white = Color.fromMonochrome(240);
    this._black = Color.fromMonochrome(15);
    this._edge_color = this._white.copy().darken(0.25);
  }

  static from_array(arr, step_duration = 15) {
    const heap = new VisualMaxHeap(arr.length, step_duration);
    arr.forEach((x) => heap.insert(x));
    return heap;
  }

  insert(value) {
    super.insert(value);
  }

  _index_level(index) {
    return Math.floor(Math.log2(index + 1));
  }

  _node_position(index, width, usable_height) {
    const level = this._index_level(index);
    const level_width = width / 2 ** level;
    const slot = index - (2 ** level - 1);

    const x = (slot + 0.5) * level_width - width / 2;
    const y = this.height > 0 ? (level * usable_height) / this.height : 0;

    return new Point(x, y);
  }

  _advance_snapshot() {
    this._prev_snap = this._curr_snap;
    this._curr_snap = this.shift_snapshot();
    this._step_frame = 0;

    this._changed_indices = new Set();
    const len = Math.max(this._prev_snap.length, this._curr_snap.length);
    for (let i = 0; i < len; i++) {
      if (this._prev_snap[i] !== this._curr_snap[i]) {
        this._changed_indices.add(i);
      }
    }
  }

  _show_array(ctx, t, width, row_height) {
    const cell_width = width / this._max_size;
    const cell_gap = cell_width * 0.1;

    ctx.save();
    for (let index = 0; index < this._curr_snap.length; index++) {
      const curr_value = this._curr_snap[index];
      const prev_value =
        this._prev_snap[index] !== undefined
          ? this._prev_snap[index]
          : curr_value;
      const value = Utils.lerp(prev_value, curr_value, t);

      const is_changed = this._changed_indices.has(index);
      const highlight = is_changed ? Utils.ease_out_poly(1 - t) : 0;
      const base_lightness = Utils.remap(value, 1, this.max_value, 35, 95);
      const lightness = Utils.lerp(base_lightness, 100, highlight);

      const x = index * cell_width + cell_gap / 2;
      const y = (row_height - cell_width + cell_gap) / 2;
      const size = cell_width - cell_gap;

      ctx.fillStyle = Color.fromHSL(0, 0, lightness).rgba;
      ctx.fillRect(x, y, size, size);

      if (highlight > 0) {
        ctx.strokeStyle = this._white.rgb;
        ctx.lineWidth = 4 * highlight;
        ctx.strokeRect(x, y, size, size);
      }

      const font_size = size * 0.4;
      if (font_size > 4) {
        ctx.font = `${font_size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this._white.rgb;
        ctx.fillText(Math.round(value), x + size / 2, y + size / 2);
      }
    }
    ctx.restore();
  }

  show(ctx) {
    if (this._curr_snap.length === 0 && this._snapshots.length === 0) return;

    if (
      this._curr_snap.length === 0 ||
      this._step_frame >= this._step_duration
    ) {
      if (this._snapshots.length > 0) this._advance_snapshot();
    }

    const t = Utils.ease_in_out_poly(
      Utils.clamp(this._step_frame / this._step_duration, 0, 1),
    );

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const max_radius = (width / this.width) * 0.4;
    const padding = max_radius * 1.5;

    const array_row_height = max_radius * 2.2;
    const tree_top = padding + array_row_height;
    const usable_height = height - tree_top - padding;

    this._show_array(ctx, t, width, array_row_height);

    ctx.save();
    ctx.translate(width / 2, tree_top);

    ctx.strokeStyle = this._edge_color.rgba;
    ctx.lineWidth = 2;
    this._curr_snap.forEach((_, index) => {
      if (index === 0) return;
      const parent = Math.floor((index - 1) / 2);
      const p1 = this._node_position(index, width, usable_height);
      const p2 = this._node_position(parent, width, usable_height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    this._curr_snap.forEach((curr_value, index) => {
      const prev_value =
        this._prev_snap[index] !== undefined
          ? this._prev_snap[index]
          : curr_value;
      const value = Utils.lerp(prev_value, curr_value, t);

      const pos = this._node_position(index, width, usable_height);
      const radius = max_radius * (0.75 + 0.25 * (value / this.max_value));
      const is_changed = this._changed_indices.has(index);
      const highlight = is_changed ? Utils.ease_out_poly(1 - t) : 0;
      const base_lightness = Utils.remap(value, 1, this.max_value, 35, 95);
      const lightness = Utils.lerp(base_lightness, 100, highlight);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = Color.fromHSL(0, 0, lightness).rgba;
      ctx.fill();

      if (highlight > 0) {
        ctx.strokeStyle = this._white.rgb;
        ctx.lineWidth = 4 * highlight;
        ctx.stroke();
      }

      const font_size = radius * 0.9;
      if (font_size > 4) {
        ctx.font = `${font_size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this._white.rgb;
        ctx.fillText(Math.round(value), pos.x, pos.y);
      }
    });
    ctx.restore();

    this._step_frame++;
  }

  get finished() {
    return (
      this._snapshots.length === 0 && this._step_frame >= this._step_duration
    );
  }
}

export { MaxHeap, VisualMaxHeap };
