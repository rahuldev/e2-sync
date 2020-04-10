const axios = require('axios');
const { constants: { systemUserToken } } = require('@e2/commons');
const SyncGateway = require('./sync-gateway');
const { services } = require('../constants');


const registerServices = (app) => {
  const serviceNames = [
    services.EXAM_SERVICE,
    services.SCHOOL_SERVICE,
    services.USER_PROGRESS_SERVICE,
    services.COURSE_SERVICE,
  ];
  serviceNames.forEach((serviceName) => {
    const serviceUrl = app.get(serviceName);
    if (serviceUrl) {
      const service = axios.create({
        baseURL: serviceUrl,
        timeout: 5000,
        headers: { Authorization: `Bearer ${systemUserToken}` },
      });
      app.set(serviceName, service);
      app.info(`Configured service ${serviceName}`);
    }
  });
  const syncGateway = new SyncGateway(app);
  app.set(services.SYNC_GATEWAY_SERVICE, syncGateway);
};

module.exports = registerServices;
