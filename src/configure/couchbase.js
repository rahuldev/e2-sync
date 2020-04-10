const couchbase = require('couchbase');


async function configureCouchbaseDb(app) {
  const couchbaseUrl = app.get('COUCHBASE_URL');
  // Ignore if the couchbase env is not set
  if (!couchbaseUrl) {
    return;
  }
  const couchbaseUsername = app.get('COUCHBASE_USERNAME');
  const couchbasePassword = app.get('COUCHBASE_PASSWORD');

  const cluster = new couchbase.Cluster(couchbaseUrl, {
    username: couchbaseUsername,
    password: couchbasePassword,
  });

  app.set('COUCHBASE', cluster);


  app.on('cleanup', () => {
    app.info('Closing Couchbase cluster');
    cluster.close();
  });
}


module.exports = configureCouchbaseDb;
