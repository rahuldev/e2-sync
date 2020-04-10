class HealthcheckService {
  setup(app) {
    this.app = app;

    this.hooks({
      after: {
        find(context) {
          if (context.result.errors) {
            context.statusCode = 500;
          }
        },
      },
    });
  }

  async find() {
    const additionalData = {};
    const errors = [];

    /** @type {import("mongodb").Db} */
    const mongoDb = this.app.get('MONGODB');
    if (mongoDb) {
      let isMongoDbConnected;
      try {
        await mongoDb.listCollections().toArray();
        isMongoDbConnected = true;
      } catch (e) {
        isMongoDbConnected = false;
        errors.push({
          message: e.message,
          stack: e.stack,
        });
      } finally {
        additionalData.isMongoDbConnected = isMongoDbConnected;
      }
    }

    return {
      name: this.app.get('name'),
      version: this.app.get('version'),
      time: new Date().toISOString(),
      ...additionalData,
      ...errors.length && { errors },
    };
  }
}


module.exports = HealthcheckService;
