'use strict';

const fs = require('fs');
const path = require('path');

const Archiver = require('archiver');
var install = require('spawn-npm-install');
const Bluebird = require('bluebird');
const uuid = require('uuid');

const pkg = {
  "name": "thingy",
  "version": "1.0.0",
  "description": "",
  "main": "handler.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {}
};


module.exports = (body, handlerPath, dependencies) => {
  dependencies = Object.assign({
    slambda: '^0.0.1',
  }, dependencies || {});

  let archive = new Archiver('zip');

  archive.on('error', console.log.bind(console));
  archive.on('close', () => {
    console.log('closing stream');
  });

  archive.append(body, {
    name: 'execute.js',
  });

  archive.append(fs.createReadStream(handlerPath), {
    name: 'handler.js',
  });

  createDependencies(dependencies)
    .then(cwd =>  archive.glob('**', { cwd }))
    .tap(() => archive.finalize())
    .catch(err => console.error(err));

  return archive;
}

function createDependencies(deps) {
  let serial = Object.keys(deps)
    .map(key => `${key}@${deps[key]}`);
  let random = uuid.v4();
  let cwd = path.join(__dirname, random);

  return Bluebird.fromCallback(cb => {
    fs.mkdir(cwd, (err) => {
      if (err) console.error(err);

      let packageJSON = Object.assign({ name: random }, pkg);
      fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(packageJSON, null, 2), () => {
        install(serial, {
          cwd,
          stdio: process.stdio,
        }, cb);
      });
    });
  }).return(cwd);
}
