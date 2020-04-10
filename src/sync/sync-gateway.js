const axios = require('axios');


class SyncGateway {
  constructor(app) {
    const syncGatewayUrl = app.get('SYNC_GATEWAY_URL');
    if (!syncGatewayUrl) {
      throw new Error('Sync gateway url not set');
    }
    /** @type {import("axios").AxiosInstance} */
    this.axios = axios.create({
      baseURL: syncGatewayUrl,
      timeout: 5000,
    });
  }

  async addDatabaseUser(databaseName, user) {
    const { username, password } = user;
    try {
      await this.axios.post(`/${databaseName}/_user`, {
        name: username,
        password,
      });
      return { created: true, existing: false };
    } catch (e) {
      const { response } = e;
      if (response.status === 409) {
        return { created: false, existing: true };
      }
      if (response.status === 404) {
        return { created: false, existing: true, databaseExists: false };
      }
      return { created: false, existing: false };
    }
  }
}

module.exports = SyncGateway;
