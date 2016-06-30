'use strict';

const Bluebird = require('bluebird');

const debug = require('debug')('slambda:Container');
const Method = require('./Method');

module.exports = class Container {
  constructor(id, storage, executor, options) {
    debug(`constructor ID: ${id}`);
    this.id = id;
    this.storage = storage;
    this.executor = executor;

    this.options = Object.assign({ autoDeploy: true }, options);

    this.run = executor.run.bind(executor);
  }

  method(id, code) {
    debug(`#method() ID: ${id} Code: ${code.toString()}`);
    let wait = this.storage.putMethod({ id, container: this.id, code })
      .then((results) => {
        console.log('method success', results);
      })
    if (this.options.autoDeploy) {
      console.log('autoDeploy');
      wait
      .then(() => {
        console.log('thened');
        this.deploy();
      });
    }
    return this;
  }

  deploy() {
    debug(`#deploy()`);
    this.storage.getContainer(this.id)
      .then(container => console.log('CONTAINER', container))
      .catch(ex => console.error(ex));

    this.storage.listMethods(this.id)
      .then(container => console.log('METHODS', container))
      .catch(ex => console.error(ex));

    return Bluebird.all([
      this.storage.getContainer(this.id),
      this.storage.listMethods(this.id),
    ])
    .tap(results => console.log('deploy fetch'))
    .spread((container, methods) => {
      console.log('deploying', container, methods);
      return this.executor.deploy(container, methods);
    })
  }
}

