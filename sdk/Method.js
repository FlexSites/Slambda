'use strict';

const Bluebird = require('bluebird');
const vm = require('vm');

module.exports = class Method {
  constructor(code) {
    this.code = code;
    this.script = wrap(code);
  }

  run(args, ctx) {
    let fn = this.script;

    return Bluebird.fromCallback(cb => {
      fn.runInNewContext({
        ctx,
        require,
        console,
        parameters: args || [],
        cb,
      });
    });
  }
}

function wrap(code) {
  return new vm.Script(`
    'use strict';

    const Bluebird = require('bluebird');
    Bluebird
      .method(${code})
      .apply(ctx, parameters)
      .asCallback(cb);
  `)
}
