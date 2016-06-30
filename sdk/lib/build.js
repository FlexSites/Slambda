'use strict';

const FileSystem = require('fs');
const Hogan = require('hogan.js');
const path = require('path');

const template = Hogan.compile(FileSystem.readFileSync(path.resolve(__dirname, 'template.hjs'), 'utf8'));

module.exports = function(container, functions) {
  functions = functions.map(fn => {
    fn.argumentString = fn.arguments.join(', ');
    console.log(fn['function']);
    fn['function'] = fn['function'].replace(/\n/gi, '\\n').replace(/"/gi, '\\"');
    console.log(fn['function']);
    return fn;
  })
  return template.render({
    container,
    functions,
    lifecycle: container.lifecycle,
  });
}
