import { MAZE_ALGORITHMS } from "./maze-algorithms.js";

class MazeAlgorithmFactory {
  static get_algorithms() {
    return MAZE_ALGORITHMS;
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

export { MazeAlgorithmFactory };
