
## Usage

### Constructor
```js
let slambda = new Slambda({
  region: 'us-east-2',
  container: 'uofu.fin',
  memory: 1024,
  timeout: 10,
});
```

### Add function

```js
slambda
  .put('before:list:business-object', (body) => {
    delete body.ssn;
    return body;
  });
```

### Execute function
```js
slambda
  .run('before:list:business-object', { id: 'seth', ssn: '000-00-0000' })
```

## Endpoints

### Update function code
`PUT /container/:container/function/:function`

### Run function
`POST /container/:container/function/:function`
