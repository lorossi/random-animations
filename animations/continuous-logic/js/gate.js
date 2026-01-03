class Gate {
  constructor(f) {
    this._f = f;
  }

  apply(x, y) {
    return this._f(x, y);
  }
}

class ANDGate extends Gate {
  constructor() {
    super((x, y) => Math.min(x, y));
  }
}

class ORGate extends Gate {
  constructor() {
    super((x, y) => Math.max(x, y));
  }
}

class XORGate extends Gate {
  constructor() {
    super((x, y) => Math.max(x, y) - Math.min(x, y));
  }
}

class XNORGate extends Gate {
  constructor() {
    super((x, y) => 1 - (Math.max(x, y) - Math.min(x, y)));
  }
}

class NOTGate extends Gate {
  constructor() {
    super((x, _) => 1 - x);
  }
}

class IDGate extends Gate {
  constructor() {
    super((x, _) => x);
  }
}

const GATE_TYPES = {
  AND: ANDGate,
  OR: ORGate,
  XOR: XORGate,
  XNOR: XNORGate,
  NOT: NOTGate,
  ID: IDGate,
};

class GateFactory {
  static createGate(type) {
    const GateClass = GATE_TYPES[type];
    if (!GateClass) {
      throw new Error(`Unknown gate type: ${type}`);
    }
    return new GateClass();
  }

  static randomGate(rand) {
    const types = Object.keys(GATE_TYPES);
    const index = Math.floor(rand.random() * types.length);
    const randomType = types[index];
    return this.createGate(randomType);
  }
}

export { ANDGate, ORGate, XORGate, XNORGate, NOTGate, GateFactory };
