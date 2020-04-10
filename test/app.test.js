const { startApp } = require('./test-helpers');


describe('app', () => {
  beforeAll(async () => {
    this.app = await startApp();
    this.rootService = this.app.createAxiosInstance('');
  });


  afterAll(async () => {
    await this.app.stop();
  });


  test('should start the server', async () => {
    await this.rootService.get('/');
  });
});
