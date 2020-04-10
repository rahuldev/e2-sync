async function checkBucketExist({ bucketName, couchbase }) {
  if (!bucketName || !couchbase) {
    return false;
  }
  const couchbaseBucketManager = couchbase.buckets();
  try {
    await couchbaseBucketManager.getBucket(bucketName);
    return true;
  } catch (e) {
    return false;
  }
}

async function getOrCreateBucket({ bucketName, couchbase }) {
  if (!bucketName || !couchbase) {
    return null;
  }
  const couchbaseBucketManager = couchbase.buckets();
  let isCreated = false;
  const bucketExists = await checkBucketExist({ bucketName, couchbase });
  if (!bucketExists) {
    isCreated = await couchbaseBucketManager.createBucket({
      name: bucketName,
      flushEnabled: true,
      ramQuotaMB: 100,
    });
  }
  const bucket = couchbase.bucket(bucketName);
  return { isCreated, bucket, bucketName };
}

function getCourseBucketName(courseId) {
  return `COURSE_${courseId}`;
}

module.exports = { getOrCreateBucket, getCourseBucketName, checkBucketExist };
