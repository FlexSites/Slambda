'use strict';

const Dynamo = require('./services/DynamoDB');
const Bluebird = require('bluebird');

const containerClient = new Dynamo('Slambda-Container', ['id', 'memory', 'timeout', 'lifecycle', 'language']);
const functionClient = new Dynamo('Slambda-Function', ['id', 'function', 'arguments', 'signature', 'container']);

module.exports = function(containerId) {
  return Bluebird.all([
    containerClient
      .findById(containerId)
      .then(conts => conts[0]),
    functionClient
      .findById(containerId, 'container'),
  ]);
};


