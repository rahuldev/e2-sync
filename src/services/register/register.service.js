const { uuid } = require('@e2/commons');
// const Errors = require('@feathersjs/errors');
const schema = require('./register.schema');
const { getOrCreateBucket, getCourseBucketName, checkBucketExist } = require('../../utils/couchbase-utils');
const { services } = require('../../constants');


class RegisterService {
  async setup(app) {
    this.app = app;

    this.schema = schema;

    /** @type {import("couchbase").Cluster} */
    this.couchbase = app.get('COUCHBASE');
    if (!this.couchbase) {
      throw new Error('Error while starting files service - COUCHBASE is not set in to app');
    }
    const bucketName = 'user-sync-registry';
    const { bucket, isCreated } = await getOrCreateBucket(
      { bucketName, couchbase: this.couchbase },
    );
    app.info(`Bucket ${bucketName}: ${isCreated}`);
    this.bucket = bucket;
    this.collection = this.bucket.defaultCollection();
    this.syncGatewayService = app.get(services.SYNC_GATEWAY_SERVICE);
  }

  async create(data) {
    const { userId, courseId } = data;
    const id = `${userId}_${courseId}`;
    const syncPass = uuid();
    const syncBucketName = getCourseBucketName(courseId);
    const syncUserStatus = await this.syncGatewayService.addSyncDatabaseUser({
      databaseName: syncBucketName,
      user: {
        username: userId,
        password: syncPass,
      },
    });
    await this.collection.upsert(id, {
      ...data, syncPass, syncDatabase: syncBucketName, syncUserStatus,
    });
    const record = await this.collection.get(id);
    const { value } = record;
    return { ...value };
  }
}

module.exports = RegisterService;
