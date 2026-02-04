import { BFS, DFS, Dijkstra, AStar } from "./algorithms.js";

class AlgorithmFactory {
  static get_algorithms() {
    return [BFS, DFS, Dijkstra, AStar];
  }

  static get_algorithm_i(index) {
    const algorithms = this.get_algorithms();
    return algorithms[index % algorithms.length];
  }
}

export { AlgorithmFactory };
