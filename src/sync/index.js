/* eslint-disable no-await-in-loop */
const { uuid } = require('@e2/commons');
const { services, allStatus } = require('../constants');
const CourseSync = require('./course');


async function getCoursesBuckets(courseIds, couchbase) {
  const couchbaseBucketManager = couchbase.buckets();
  const courseBuckets = {};
  for (const courseId of courseIds) {
    const bucketName = `COURSE_${courseId}`;
    let bucket = null;
    try {
      bucket = couchbase.bucket(bucketName);
    } catch (e) {
      if (await couchbaseBucketManager.createBucket({
        name: bucketName,
        flushEnabled: true,
        ramQuotaMB: 128,
      })) {
        bucket = couchbase.bucket(bucketName);
      }
    }
    courseBuckets[courseId] = bucket;
  }
  return courseBuckets;
}

async function upsertAllRecords({ courseId, bucket, allRecords = [] }) {
  if (bucket != null && allRecords.length) {
    allRecords.push({ id: courseId, updatedAt: new Date().toJSON(), entityType: 'LAST_UPDATE' });
    await Promise.all(allRecords.map((record) => {
      const recordId = `${record.entityType}::${record.id}` || uuid();
      return bucket.defaultCollection().upsert(recordId, record);
    }));
    return { courseId, status: true };
  }
  return { courseId, status: false };
}

async function syncActiveCourses(app) {
  const courseService = app.get(services.COURSE_SERVICE);
  const { data: { data: courses = [] } = {} } = await courseService.get('/courses', {
    params: {
      status: allStatus.ACTIVE,
    },
  });
    /** @type {import("couchbase").Cluster} */
  const couchbase = app.get('COUCHBASE');
  const coursesBuckets = await getCoursesBuckets(courses.map(x => x.id), couchbase);
  const results = [];
  for (const course of courses) {
    app.info(`Getting records for (${course.id}) - ${course.name}`);
    const courseSync = new CourseSync(app, course.id);
    const allRecords = await courseSync.getAllCourseRecords();
    app.info(`Got records for (${course.id}) - ${course.name}: ${allRecords.length}`);
    const result = await upsertAllRecords({
      courseId: course.id,
      bucket: coursesBuckets[course.id],
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
      app.error('Error occurred during sync', err);
      timeout = setTimeout(async () => {
        await startSync();
      }, 5 * 60 * 1000);
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
