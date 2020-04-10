const axios = require('axios');


class SyncGateway {
  constructor(app) {
    this.app = app;
    this.couchbaseSyncUrl = app.get('COUCHBASE_SYNC_URL');
    this.couchbaseSyncUsername = app.get('COUCHBASE_SYNC_USERNAME');
    this.couchbaseSyncPassword = app.get('COUCHBASE_SYNC_PASSWORD');
    const syncGatewayUrl = app.get('COUCHBASE_SYNC_GATEWAY_URL');
    if (!syncGatewayUrl) {
      throw new Error('Sync gateway url not set');
    }
    /** @type {import("axios").AxiosInstance} */
    this.axios = axios.create({
      baseURL: syncGatewayUrl,
      timeout: 2 * 60 * 1000,
    });
  }

  async addSyncDatabase({ databaseName }) {
    this.app.info(`Adding ${databaseName} in sync server`);
    try {
      await this.axios.put(`/${databaseName}`, {
        server: this.couchbaseSyncUrl,
        bucket: databaseName,
        username: this.couchbaseSyncUsername,
        password: this.couchbaseSyncPassword,
        num_index_replicas: 0,
        enable_shared_bucket_access: true,
        import_docs: 'continuous',
      });
      this.app.info(`Added ${databaseName} in sync server`);
      return { created: true, existing: false };
    } catch (e) {
      console.log(e);
      const { response } = e;
      if (response.status === 412) {
        return { created: false, existing: true };
      }
      if (response.status === 404) {
        this.app.error(`${databaseName}: not found`);
      }
      return { created: false, existing: false };
    }
  }

  async addSyncDatabaseUser({ databaseName, user }) {
    const { username, password } = user;
    try {
      const { status } = await this.axios.put(`/${databaseName}/_user/${username}`, {
        name: username,
        password,
      });
      if (status === 201) {
        return { created: true, existing: false, databaseExists: true };
      }
      return { created: false, existing: true, databaseExists: true };
    } catch (e) {
      const { response } = e;
      if (response.status === 409) {
        return { created: false, existing: true, databaseExists: true };
      }
      if (response.status === 404) {
        return { created: false, existing: false, databaseExists: false };
      }
      return { created: false, existing: false, databaseExists: false };
    }
  }
}

module.exports = SyncGateway;
