# e2-sync

Service to sync courses, contents, questions, etc... for client

## Run Steps

Run `npm install` to install dependencies.  
Run `npm test` to run all tests.  
Run `npm start` to start the service.

## Dependencies

### Databases

| Database  | Version
| ------------- | ------------- |
| Couchbase  | 6.5.x

### Services

| Service  | Version
| ------------- | ------------- |
| e2-course  | x.x.x
| e2-question-bank  | x.x.x
| e2-feedback  | x.x.x
| e2-files  | x.x.x
| e2-exam  | x.x.x
| e2-user-progress  | x.x.x
| e2-school  | x.x.x

### Environment Variables

| Environment Variable  | Description | Default Value
| ------------- | ------------- | ------------- |
| PORT  | Port on which the service should run  | 5004
| COUCHBASE_URL | Couchbase url  | couchbase://localhost:8091
| COUCHBASE_USERNAME | Couchbase username  | admin
| COUCHBASE_PASSWORD | Couchbase password  | password
| KAFKA_CONFIG | Kafka connection string | {"clientId": "e2","brokers": ["localhost:9092"]}
| EXAM_SERVICE | Exam Service internal Url | http://dev3-e2.saal.ai:5443/e2-exam
| USER_PROGRESS_SERVICE | User progress internal Service URl | http://dev3-e2.saal.ai:5443/e2-user-progress
| SCHOOL_SERVICE | School service internal url | http://dev3-e2.saal.ai:5443/e2-school
| COURSE_SERVICE | Course Service internal url | http://dev3-e2.saal.ai:5443/e2-course

## Monitoring URLs

| Type  | URL | Expected Response Code | Sample Response (JSON)
| ------------- | ------------- | ------------- |------------- |
| Healthcheck  | `/healthcheck`   | 200 | `{"name":"e2-files","version":"1.0.0","time":"2019-06-21T08:02:59.842Z"}`
| Smoke Test  | `/healthcheck`   | 200 | `{"total":0,"skip":0,"limit":0,"data":[]}`

## Authors

| Name  | Email |
| ------------- | ------------- |
| Saleel Salam | `saleel@saal.ai`
| Rahul Dev | `rahul@saal.ai`
