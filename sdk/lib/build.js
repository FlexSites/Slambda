'use strict';

const FileSystem = require('fs');
const Hogan = require('hogan.js');
const path = require('path');

const template = Hogan.compile(FileSystem.readFileSync(path.resolve(__dirname, 'template.hjs'), 'utf8'));

module.exports = function(container, methods) {
  methods = methods.map(fn => {
    fn.code = fn
      .code
      .toString()
      .replace(/\n/gi, '\\n')
      .replace(/"/gi, '\\"');
    return fn;
  })
  return template.render({
    container,
    methods,
    lifecycle: container.lifecycle,
  });
}
