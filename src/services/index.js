const healthcheckService = require('./healthcheck');
const registerService = require('./register');


function configureServices(app) {
  app.use('/', healthcheckService); // Serve healthcheck on root
  app.use('/healthcheck', healthcheckService);
  app.use('/register', registerService); // Load service with middleware
}


module.exports = configureServices;
