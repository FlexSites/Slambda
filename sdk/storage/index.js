'use strict';

const Bluebird = require('bluebird');

const Memory = require('./Memory');
const Mongo = require('./Mongo');
const Dynamo = require('./Dynamo');

const NotFound = require('../lib/errors').NotFoundError;


const debug = require('debug')('slambda:storage');


const strategies = {
  memory: Memory,
  dynamo: Dynamo,
  mongo: Mongo,
};

module.exports = class Storage {
  constructor(config, containerDefaults) {
    this.service = new (strategies[config.strategy] || Memory)(config);

    this.methodTable = config.tables.method;
    this.containerTable = config.tables.container;

    this.containerDefaults = containerDefaults;
  }

  getMethod(methodId) {
    debug(`#getMethod() ${JSON.stringify(arguments)}`);
    return this.service.get(this.methodTable, methodId);
  }

  listMethods(containerId) {
    debug(`#listMethods() ${JSON.stringify(arguments)}`);
    return this.service.findById(this.methodTable, 'container', containerId)
  }

  putMethod(method) {
    debug(`#putMethod() ${JSON.stringify(arguments)}`);
    return this.service.put(this.methodTable, method);
  }

  deleteMethod(methodId) {
    debug(`#deleteMethod() ${JSON.stringify(arguments)}`);
    return this.service.delete(this.methodTable, method);
  }

  getContainer(containerId) {
    debug(`#getContainer() ${JSON.stringify(arguments)}`);
    return this.service.get(this.containerTable, containerId)
      .catch(() => ({}))
      .then(merge(this.containerDefaults))
      .then(container => {
        if (!container.id) container.id = containerId;
        return container;
      });
  }

  listContainers() {
    debug(`#listContainers() ${JSON.stringify(arguments)}`);
    return this.service.list(this.containerTable)
      .then(merge(this.containerDefaults))
  }

  putContainer(container) {
    debug(`#putContainer() ${JSON.stringify(arguments)}`);
    return this.service.delete(this.containerTable, container);
  }

  deleteContainer(containerId) {
    debug(`#deleteContainer() ${JSON.stringify(arguments)}`);
    return this.service.delete(this.containerTable, containerId);
  }


}

function merge(defaults) {
  const mergeDefaults = (container) => {
    if (Array.isArray(container)) return container.map(mergeDefaults);
    return Object.assign({}, defaults, container);
  }
  return mergeDefaults;
}
