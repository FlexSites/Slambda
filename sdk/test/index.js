

const Slambda = require('../index');

let slambda = new Slambda();

let container = slambda
  .container('uofu.fin');

container
  .method('list:business-objects', (body) => {
    body.ssn = `****-**-${body.ssn.substr(9)}`;
    return body;
  });

setTimeout(() => {
  container
    .run('list:business-objects', [{ id: 'seth', ssn: '000-00-0000' }])
    .then(results => {
      console.log('results', results);
    })
    .catch(ex => console.error(ex));
}, 500);
