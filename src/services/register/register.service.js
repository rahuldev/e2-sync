const { uuid } = require('@e2/commons');
// const Errors = require('@feathersjs/errors');
const schema = require('./register.schema');
const { getOrCreateBucket, getCourseBucketName, checkBucketExist } = require('../../utils/couchbase-utils');


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
  }

  async create(data) {
    const { userId, courseId } = data;
    const id = `${userId}_${courseId}`;
    try {
      const record = await this.collection.get(id);
      const { value } = record;
      const syncBucketExists = await checkBucketExist({
        bucketName: value.syncBucket,
        couchbase: this.couchbase,
      });
      return { ...value, syncBucketExists };
    } catch (error) {
      const syncPass = uuid();
      const syncBucket = getCourseBucketName(courseId);
      await this.collection.insert(id, { ...data, syncPass, syncBucket });
    }
    const record = await this.collection.get(id);
    const { value } = record;
    const syncBucketExists = await checkBucketExist({
      bucketName: value.syncBucket,
      couchbase: this.couchbase,
    });
    return { ...value, syncBucketExists };
  }
}

module.exports = RegisterService;
