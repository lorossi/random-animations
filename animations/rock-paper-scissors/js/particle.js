class Particle {
  constructor(type, fill_color, start_score = 2) {
    this._type = type;
    this._fill_color = fill_color;

    this._start_score = start_score;
    this._score = this._start_score;
    this._replacement = null;
  }

  getFillColor() {
    return this._fill_color;
  }

  setFillColor(color) {
    this._fill_color = color;
  }

  getType() {
    return this._type;
  }

  getScore() {
    return this._score;
  }

  getToReplace() {
    return this._score < 0;
  }

  getReplacementType() {
    return this._replacement;
  }

  resetScore() {
    this._score = this._start_score;
  }

  fight(other) {
    if (this._score < 0) return;
    if (other.getScore() < 0) return;
    if (this._type === other._type) return;

    const lost =
      (other._type === ParticleType.PAPER &&
        this._type === ParticleType.ROCK) ||
      (other._type === ParticleType.SCISSORS &&
        this._type === ParticleType.PAPER) ||
      (other._type === ParticleType.ROCK &&
        this._type === ParticleType.SCISSORS);

    if (lost) this._score--;
    if (this._score < 0) this._replacement = other.getType();
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.getFillColor().rgba;
    ctx.fillRect(0, 0, 1, 1);
    ctx.restore();
  }
}

class Rock extends Particle {
  constructor(fill_color, start_score = 2) {
    super(ParticleType.ROCK, fill_color, start_score);
  }
}

class Paper extends Particle {
  constructor(fill_color, start_score = 2) {
    super(ParticleType.PAPER, fill_color, start_score);
  }
}

class Scissors extends Particle {
  constructor(fill_color, start_score = 2) {
    super(ParticleType.SCISSORS, fill_color, start_score);
  }
}

class ParticleFactory {
  static fromIndex(index, palette, start_score = 2) {
    if (index < 0 || index > 2) throw new Error("Invalid index");

    const types = [Rock, Paper, Scissors];
    return new types[index](palette.colors[index], start_score);
  }

  static fromType(type, palette, start_score = 2) {
    if (type < 0 || type > 2) throw new Error("Invalid type");

    return ParticleFactory.fromIndex(type, palette, start_score);
  }
}

const ParticleType = {
  ROCK: 0,
  PAPER: 1,
  SCISSORS: 2,
};

export { Particle, ParticleFactory, ParticleType };
