const { startApp } = require('../test-helpers');


describe('healthcheck', () => {
  beforeAll(async () => {
    this.app = await startApp();
    this.healthcheckService = this.app.createAxiosInstance('healthcheck');
  });

  afterAll(async () => {
    await this.app.stop();
  });


  test('should serve healthcheck service', async () => {
    const { data, status } = await this.healthcheckService.get('/');
    expect(status).toEqual(200);
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('time');
  });
});
