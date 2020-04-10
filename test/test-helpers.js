const getPort = require('get-port');
const axios = require('axios');


const syncCourses = jest.mock('../src/sync/index');
syncCourses.requireMock('./sync-mock');

async function startApp() {
  // Set port
  const port = await getPort();
  process.env.PORT = port;

  const app = require('../src/app'); /* eslint-disable-line global-require */

  await app.start();

  const defaultToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjVkMTBhN2QwM2QzZmUxYTQ2Y2QzY2IxMyJ9.eyJqdGkiOiJiQTNpM0FhOGtLWn5zbVN4d0RHUEMiLCJzdWIiOiI1ZDEwYTc4OTNkM2ZlMWE0NmNkM2NiMTIiLCJpc3MiOiJodHRwczovL2UyLWRldi11YXQtaWRwLnNhYWwuYWkiLCJpYXQiOjE1NjMyNzkwMzAsImV4cCI6MTU2MzI4NjIzMCwic2NvcGUiOiJvcGVuaWQiLCJuYW1lIjoiU2FhbCIsImdyb3VwcyI6W3sidHlwZSI6IkNPVVJTRTEiLCJpZCI6IjExMjMxMjMtMTIzLTEtMjMtMTIzLTEtMjMiLCJyb2xlcyI6WyJzdHVkZW50Il19XSwia2V5Ijoic2FhbCIsImF1ZCI6ImUyLWRldi1pcnAifQ.DLJk7k0crZq_4FwZeextD_hlkdrISAx0i_IFtZxMw2KkrGvTNnIpM_R1AKc__lOa_sannFyCqgGWnZ6TP8C3yPxD_3CRNhDLiDGf83p2HQ-89r4GWR_0ENRhVudhr2zU4I99k346FaDPZcyrGspMsuwerx0YJZDbQrmgs0TJIbeZJUqniGYho-hcPGjhWdnM8O-UIRegRBGwnXAbinaa2LN8C-AiNKRMI8481-DiJynvpCtWgon5Ob2g04D7yCeYsio0zrKQVteZ2a-8SGNT1Ws1P3HmH6lRB8gVFQiAzm6-mPmKf0yl3_ovJWP2krY6ATHnI1Z1UYY2CnS84zYy8Q';
  app.createAxiosInstance = (servicePath, jwtToken = defaultToken) => {
    const instance = axios.create({
      baseURL: `http://127.0.0.1:${port}/${servicePath}`,
      timeout: 2000,
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    instance.interceptors.response.use(response => response, (error) => {
      if (error.response) {
        /* eslint-disable-next-line no-param-reassign */
        error.message = `${error.message}\n${JSON.stringify(error.response.data)}`;
      }
      return Promise.reject(error);
    });

    return instance;
  };

  return app;
}


module.exports = {
  startApp,
};
