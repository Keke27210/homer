class Method {
  constructor(name, simple, complex, split = []) {
    this.name = name;
    this.simple = simple;
    this.complex = complex;
    this.split = split;
  }

  parseSimple(env) {
    return this.simple ? this.simple(env) : null;
  }

  parseComplex(env, params) {
    return this.complex ? this.complex(env, params) : null;
  }
}

module.exports = Method;
