'use strict';

const Local = require('./Local');
const Docker = require('./Docker');
const AWS = require('./AWS');
const Google = require('./Google');

const strategies = {
  local: Local,
  aws: AWS,
  docker: Docker,
  google: Google,
};

module.exports = (strategy) => strategies[strategy] || Local;
