'use strict';

const Bluebird = require('bluebird');

module.exports = class Batch {
  constructor(executor, manual) {
    this.inputs = [];
    this.promises = [];
    this.executor = executor;
    this.manual = manual;
    if (!manual) this.auto();
  }

  run(id, args) {
    if (!this.manual) this.auto();
    this.inputs.push({ id, arguments: args });
    return new Bluebird((resolve, reject) => {
      this.promises.push({ resolve, reject });
    });
  }

  auto() {
    process.nextTick(() => this.flush());
  }

  flush() {
    let inputs = this.inputs;
    let promises = this.promises;
    this.inputs = [];
    this.promises = [];
    this.executor(inputs)
      .then(outputs =>
        outputs.map((output, idx) => {
          promises[idx].resolve(output);
        })
      )
  }
}
