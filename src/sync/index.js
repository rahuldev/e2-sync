/* eslint-disable no-await-in-loop */
const { uuid } = require('@e2/commons');
const { services, allStatus, entities } = require('../constants');
const { getOrCreateBucket, getCourseBucketName } = require('../utils/couchbase-utils');
const CourseSync = require('./course');


async function registerBucketSync(app, buckets) {
  const syncGatewayService = app.get(services.SYNC_GATEWAY_SERVICE);
  for (const bucket of Object.values(buckets)) {
    if (bucket.created || bucket.existing) {
      await syncGatewayService.addSyncDatabase({ databaseName: bucket.bucketName });
    }
  }
}

async function getCoursesBuckets(app, { courseIds }) {
  const couchbase = app.get('COUCHBASE');
  const courseBuckets = {};
  for (const courseId of courseIds) {
    const bucketName = getCourseBucketName(courseId);
    const bucket = await getOrCreateBucket({ bucketName, couchbase });
    courseBuckets[courseId] = bucket;
  }
  registerBucketSync(app, courseBuckets);
  return courseBuckets;
}

async function upsertAllRecords({ courseId, bucket, allRecords = [] }) {
  if (bucket != null && allRecords.length) {
    allRecords.push({
      id: courseId, updatedAt: new Date().toJSON(), entityType: entities.LAST_UPDATE,
    });
    await Promise.all(allRecords.map((record) => {
      const recordId = `${record.entityType}::${record.id}` || uuid();
      return bucket.defaultCollection().upsert(recordId, record);
    }));
    return { courseId, status: true };
  }
  return { [courseId]: false };
}

async function syncActiveCourses(app) {
  const courseService = app.get(services.COURSE_SERVICE);
  const { data: { data: courses = [] } = {} } = await courseService.get('/courses', {
    params: {
      status: allStatus.ACTIVE,
      limit: 2,
    },
  });
  const coursesBuckets = await getCoursesBuckets(app,
    { courseIds: courses.map(x => x.id) });
  const results = [];
  for (const course of courses) {
    app.info(`Getting records for (${course.id}) - ${course.name}`);
    const courseSync = new CourseSync(app, course.id);
    const allRecords = await courseSync.getAllCourseRecords();
    app.info(`Got records for (${course.id}) - ${course.name}: ${allRecords.length}`);
    const { bucket, isCreated, bucketName } = coursesBuckets[course.id];
    if (isCreated === true) {
      app.info(`Bucket ${bucketName}: ${isCreated}`);
    }
    const result = await upsertAllRecords({
      courseId: course.id,
      bucket,
      allRecords,
    });
    app.info(`Records updated for (${course.id}) - ${course.name}`, result);
    results.push(result);
  }
  return results;
}

async function syncCourses(app) {
  app.info('Starting sync');
  let timeout;

  function startSync() {
    syncActiveCourses(app).then((syncStatus) => {
      app.log(syncStatus);
      timeout = setTimeout(async () => {
        await startSync();
      }, 5 * 60 * 1000);
    }).catch((err) => {
      app.error('Error occurred during sync', err.message);
      timeout = setTimeout(async () => {
        await startSync();
      }, 5 * 60 * 60 * 1000);
    });
  }

  startSync();

  app.on('cleanup', () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}

module.exports = syncCourses;
