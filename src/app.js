const { createApp } = require('@e2/commons');
const packageJson = require('../package.json');
const configureServices = require('./services');
const migrations = require('./migrations');
const configureCouchbaseDb = require('./configure/couchbase');
const registerServices = require('./sync/register-services');
const syncCourses = require('./sync');


const { name, version } = packageJson;
const app = createApp({
  name,
  version,
  configurations: [configureCouchbaseDb, configureServices],
  plugins: [registerServices, syncCourses],
  migrations,
});

module.exports = app;
