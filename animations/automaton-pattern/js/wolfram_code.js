const RuleType = {
  LeftBias: 1,
  RightBias: 7,
  CenterMax: 2,
  CenterMin: 3,
  MoveLeft: 4,
  MoveRight: 5,
  Average: 6,
};
Object.freeze(RuleType);

class WolframCodeGenerator {
  static generate(radix, code_type, rng) {
    const code_length = Math.pow(radix, 3);

    let code = "";
    for (let i = 0; i < code_length; i++) {
      const cells = i
        .toString(radix)
        .padStart(3, "0")
        .split("")
        .map((v) => parseInt(v));
      const [left, center, right] = cells;

      let new_rule = 0;
      switch (code_type) {
        case RuleType.LeftBias:
          new_rule = rng.pick([left, center]);
          break;
        case RuleType.RightBias:
          new_rule = rng.pick([center, right]);
          break;
        case RuleType.CenterMax:
          new_rule = Math.max(...cells) + 1;
          break;
        case RuleType.CenterMin:
          new_rule = Math.min(...cells) - 1;
          break;
        case RuleType.MoveLeft:
          new_rule = right;
          break;
        case RuleType.MoveRight:
          new_rule = left;
          break;
        case RuleType.Average:
          let rule_cells = cells.sort((a, b) => a - b);
          new_rule = rule_cells[1];
          break;
      }

      code += WolframCodeGenerator.wrap(new_rule, radix).toString(radix);
    }

    return btoa(code);
  }
  static generateRandom(radix, rng) {
    const code_type = WolframCodeGenerator.getRandomRuleType(rng);
    return WolframCodeGenerator.generate(radix, code_type, rng);
  }

  static getRandomRuleType(rng) {
    return rng.pick(Object.entries(RuleType))[1];
  }

  static wrap(x, radix) {
    while (x < 0) x += radix;
    while (x >= radix) x -= radix;
    return x;
  }
}

export { RuleType, WolframCodeGenerator };
