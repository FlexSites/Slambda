'use strict';

const AWS = require('aws-sdk');
const Bluebird = require('bluebird');
const linter = require('eslint').linter;
const Storage = require('./storage');
const Container = require('./Container');
const getExecution = require('./execution');
const debug = require('debug')('slambda');

AWS.config.setPromisesDependency(Bluebird);

const defaultOptions = {
  autoDeploy: true,
  container: {
    language: 'nodejs4.3',
    lifecycle: {
      init: () => {},
      pre: () => {},
      post: () => {},
    },
    memory: 1024,
    region: 'us-east-1',
    timeout: 10,
  },
  storage: {
    strategy: 'memory',
    tables: {
      container: 'Slambda-Container',
      method: 'Slambda-Method',
    },
  },
  execution: {
    strategy: 'local',
    aws: {
      region: 'us-east-1',
      s3: {
        bucket: 'io.graphyte.sandbox',
        prefix: 'archive',
      },
    },
  },
};

module.exports = class Slambda {
  constructor(options) {
    if (typeof options === 'string') options = { container: options };
    this.options = Object.assign({}, defaultOptions, options);

    let Execution = getExecution(this.options.execution.strategy);

    this.storage = new Storage(this.options.storage, this.options.container);
    this.execution = (id) => new Execution(id, this.options.execution);
  }

  container(id, container) {
    debug(`#container ID: ${id} Container: ${container}`);
    if (container) {
      this.storage.putContainer(Object.assign({ id }, container));
    }

    return new Container(id, this.storage, this.execution(id), { autoDeploy: this.options.autoDeploy });
  }
}



