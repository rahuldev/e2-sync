const { uuid } = require('@e2/commons');
// const Errors = require('@feathersjs/errors');
const schema = require('./register.schema');


class RegisterService {
  async setup(app) {
    this.app = app;

    this.schema = schema;

    /** @type {import("couchbase").Cluster} */
    this.couchbase = app.get('COUCHBASE');
    if (!this.couchbase) {
      throw new Error('Error while starting files service - COUCHBASE is not set in to app');
    }
    this.bucket = await this.couchbase.bucket('test-bucket');
    this.collection = this.bucket.defaultCollection();
  }

  async create(data) {
    const id = uuid();
    await this.collection.upsert(id, data);
    return data;
  }
}

module.exports = RegisterService;
