import { PATHFINDING_ALGORITHMS } from "./pathfinding-algorithms.js";

class PathfindingAlgorithmFactory {
  static get_algorithms() {
    return PATHFINDING_ALGORITHMS;
  }

  static get_algorithm_i(index) {
    const algorithms = this.get_algorithms();
    return algorithms[index % algorithms.length];
  }

  static get_random_algorithm(xor128) {
    const algorithms = this.get_algorithms();
    return xor128.pick(algorithms);
  }
}

export { PathfindingAlgorithmFactory };
