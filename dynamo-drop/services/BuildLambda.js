'use strict';

console.info('Loading function');
const Bluebird = require('bluebird');
const AWS = require('aws-sdk');
const FileSystem = require('fs');
const Hogan = require('hogan.js');
const Archiver = require('archiver');
const path = require('path');

AWS.config.setPromisesDependency(Bluebird);

const Bucket = 'io.graphyte.sandbox';

const region = 'us-east-1';
const s3 = new AWS.S3({ region, params: { Bucket } });
const lambda = new AWS.Lambda({ region });

const template = Hogan.compile(FileSystem.readFileSync('template.hjs', 'utf8'));

module.exports = function(container, functions) {
  functions = functions.map(fn => {
    fn.argumentString = fn.arguments.join(', ');
    return fn;
  })
  let body = template.render({
    container,
    functions,
    str: JSON.stringify(container.lifecycle, null, 2),
    lifecycle: container.lifecycle,
  });
  let Key = `archive/${container.id}.zip`;

  return Bluebird.fromCallback(cb => {
    let req = s3
      .upload({
        Key,
        Body: createArchive(body),
        Bucket,
      }, {}, cb);

    req.on('httpUploadProgress', function(evt) { console.info(evt); })
  })
  .then((obj) => {
    return updateLambda(`slambda-${container.id.replace(/\W+/, '-')}`, {
      Key,
      Bucket,
    });
  })
  .catch(console.error.bind(console));
};

function updateLambda(FunctionName, s3Options) {
  return lambda.getFunction({
    FunctionName,
  }).promise().reflect()
  .then(fn => {
    if (fn.isRejected()) {
      let params = {
        Code: { /* required */
          S3Bucket: s3Options.Bucket,
          S3Key: s3Options.Key,
        },
        FunctionName,
        Handler: 'handler.handler',
        Role: 'arn:aws:iam::611601652995:role/graphyte-microservices-dev-r-IamRoleLambda-16OO7ZHGUUC5A', /* required */
        Runtime: 'nodejs4.3',
        MemorySize: 1024,
        Publish: true,
        Timeout: 10,
      };
      if (s3Options.Version) params.Code.S3ObjectVersion = s3Options.Version;
      return lambda.createFunction(params).promise();
    }

    let params = {
      FunctionName,
      S3Key: s3Options.Key,
      S3Bucket: s3Options.Bucket,
    };
    if (s3Options.Version) params.S3ObjectVersion = s3Options.Version;
    return lambda.updateFunctionCode(params).promise();
  })

}

function createArchive(fn) {
  let archive = new Archiver('zip');

  archive.on('error', console.log.bind(console));
  archive.on('close', console.log.bind(console));

  archive.append(fn, {
    name: 'handler.js',
  });
  archive.glob('**', {
    cwd: path.resolve(__dirname, '../_shared/')
  });
  archive.finalize();
  return archive;
}
