const apm = require('elastic-apm-node');


if (process.env.ELASTIC_APM_SERVER_URL) {
  apm.start({});
}

const app = require('./app');


app.start();
