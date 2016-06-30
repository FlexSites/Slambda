'use strict';

const Bluebird = require('bluebird');

const debug = require('debug')('slambda:Container');

module.exports = class Batch {
  constructor(executor, manual) {
    debug('constructor');
    this.inputs = [];
    this.promises = [];
    this.executor = executor;
    this.manual = manual;

    this.flushing = false;
  }

  run(id, args) {
    debug(`#run() ID: ${id}`);
    if (!this.manual) this.auto();
    this.inputs.push({ id, arguments: args });
    return new Bluebird((resolve, reject) => {
      this.promises.push({ resolve, reject });
    });
  }

  auto() {
    if (this.flushing) return;

    debug(`#auto() Setting up nextTick flush`);
    process.nextTick(() => this.flush());
    this.flushing = true;
  }

  flush() {
    debug(`#flush() ${this.inputs.length} queued calls`);

    this.flushing = false;
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
