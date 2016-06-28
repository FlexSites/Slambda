'use strict';

const get = require('lodash.get');
const Dynamo = require('./services/DynamoDB');
const Bluebird = require('bluebird');
const buildLambda = require('./services/BuildLambda');

const containerClient = new Dynamo('Slambda-Container', ['id', 'memory', 'timeout', 'lifecycle', 'language'])
const functionClient = new Dynamo('Slambda-Function', ['id', 'function', 'arguments', 'signature', 'container'])


module.exports.handler = function(event, context, cb) {
  let updates = event
    .Records
    .reduce((all, record) => {
      let image = record.dynamodb.NewImage;
      let key = get(image, ['container', 'S']) || get(image, ['id', 'S']);
      if (key && record.eventName !== 'REMOVE' && !~all.indexOf(key)) {
        all.push(key);
      }
      return all;
    }, [])
    .map(containerId =>
      Bluebird.all([
        containerClient.findById(containerId),
        functionClient.findById(containerId, 'container'),
      ])
      .spread((container, functions) => buildLambda(container[0], functions))
      .reflect()
    );

  return Bluebird.all(updates).asCallback(cb);
};


