const axios = require('axios');
const { constants: { systemUserToken } } = require('@e2/commons');


const registerServices = (app) => {
  const serviceNames = ['EXAM_SERVICE', 'SCHOOL_SERVICE', 'USER_PROGRESS_SERVICE', 'COURSE_SERVICE'];
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
};

module.exports = registerServices;
