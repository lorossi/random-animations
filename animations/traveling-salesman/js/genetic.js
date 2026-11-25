class GeneticTSP {
  constructor(points, random, options = {}) {
    this._points = points;
    this._random = random;
    this._n = points.length;

    this._population_size = options.population_size ?? 200;
    this._elite_count = options.elite_count ?? 4;
    this._tournament_size = options.tournament_size ?? 5;
    this._mutation_rate = options.mutation_rate ?? 0.25;
    this._inversion_prob = options.inversion_prob ?? 0.8;

    this._dist = this._computeDistanceMatrix(points);
    this._generation = 0;
    this._best_order = null;
    this._best_distance = Infinity;
    this._population = [];

    this._initPopulation();
    this._evaluate();
  }

  _computeDistanceMatrix(points) {
    const n = points.length;
    const matrix = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = points[i].distance(points[j]);
        matrix[i][j] = d;
        matrix[j][i] = d;
      }
    }
    return matrix;
  }

  _tourDistance(order) {
    let total = 0;
    const n = this._n;
    const dist = this._dist;
    for (let i = 0; i < n; i++) {
      const a = order[i];
      const b = order[(i + 1) % n];
      total += dist[a][b];
    }
    return total;
  }

  _initPopulation() {
    const base = Array.from({ length: this._n }, (_, i) => i);
    this._population = Array.from({ length: this._population_size }, () => {
      const order = this._random.shuffle(base);
      return { order, distance: 0 };
    });
  }

  _evaluate() {
    for (let i = 0; i < this._population.length; i++) {
      this._population[i].distance = this._tourDistance(
        this._population[i].order,
      );
    }

    this._population.sort((a, b) => a.distance - b.distance);

    const best = this._population[0];
    if (best.distance < this._best_distance - 1e-6) {
      this._best_distance = best.distance;
      this._best_order = best.order.slice();
      return true;
    }
    return false;
  }

  _tournamentSelect() {
    let best_idx = this._population_size - 1;
    for (let i = 0; i < this._tournament_size; i++) {
      const idx = this._random.random_int(0, this._population_size);
      if (idx < best_idx) {
        best_idx = idx;
      }
    }
    return this._population[best_idx].order;
  }

  _orderCrossover(parent_a, parent_b) {
    const n = this._n;
    let a = this._random.random_int(0, n);
    let b = this._random.random_int(0, n);
    if (a > b) [a, b] = [b, a];

    const child = new Array(n);
    const used = new Uint8Array(n);

    for (let i = a; i <= b; i++) {
      const gene = parent_a[i];
      child[i] = gene;
      used[gene] = 1;
    }

    let write_idx = (b + 1) % n;
    for (let i = 0; i < n; i++) {
      const gene = parent_b[(b + 1 + i) % n];
      if (!used[gene]) {
        child[write_idx] = gene;
        write_idx = (write_idx + 1) % n;
      }
    }

    return child;
  }

  _mutate(order) {
    if (this._random.random() > this._mutation_rate) {
      return;
    }

    const n = this._n;
    let a = this._random.random_int(0, n);
    let b = this._random.random_int(0, n);
    if (a === b) return;
    if (a > b) [a, b] = [b, a];

    if (this._random.random() < this._inversion_prob) {
      // 2-opt style sub-tour inversion
      while (a < b) {
        const tmp = order[a];
        order[a] = order[b];
        order[b] = tmp;
        a++;
        b--;
      }
    } else {
      // swap two cities
      const tmp = order[a];
      order[a] = order[b];
      order[b] = tmp;
    }
  }

  step() {
    const next_pop = [];

    for (let i = 0; i < this._elite_count; i++) {
      next_pop.push({
        order: this._population[i].order.slice(),
        distance: 0,
      });
    }

    while (next_pop.length < this._population_size) {
      const parent_a = this._tournamentSelect();
      const parent_b = this._tournamentSelect();
      const child = this._orderCrossover(parent_a, parent_b);
      this._mutate(child);
      next_pop.push({ order: child, distance: 0 });
    }

    this._population = next_pop;
    this._generation++;
    const improved = this._evaluate();

    return {
      improved,
      best_order: this._best_order,
      best_distance: this._best_distance,
      generation: this._generation,
    };
  }

  get best_order() {
    return this._best_order;
  }

  get best_distance() {
    return this._best_distance;
  }

  get generation() {
    return this._generation;
  }

  topOrders(count) {
    const limit = Math.min(count, this._population.length);
    const result = [];
    for (let i = 0; i < limit; i++) {
      result.push(this._population[i].order);
    }
    return result;
  }
}

export { GeneticTSP };
