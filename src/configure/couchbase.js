const couchbase = require('couchbase');


async function configureCouchbaseDb(app) {
  const couchbaseUrl = app.get('COUCHBASE_URL');
  // Ignore if the couchbase env is not set
  if (!couchbaseUrl) {
    return;
  }
  const couchbaseUsername = app.get('COUCHBASE_USERNAME');
  const couchbasePassword = app.get('COUCHBASE_PASSWORD');
  const initBucket = app.get('COUCHBASE_INIT_BUCKET') || 'init-bucket';
  const cluster = await couchbase.Cluster.connect(couchbaseUrl, {
    username: couchbaseUsername,
    password: couchbasePassword,
  });

  cluster.bucket(initBucket);
  app.set('COUCHBASE', cluster);


  app.on('cleanup', () => {
    app.info('Closing Couchbase cluster');
    cluster.close();
  });
}


module.exports = configureCouchbaseDb;
