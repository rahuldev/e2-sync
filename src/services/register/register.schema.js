const { schemas } = require('@e2/commons');


const schema = {
  model: {
    $id: 'https://e2.saal.ai/files/schemas/register-sync',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'File',
    type: 'object',
    properties: {
      ...schemas.maintenance,
      courseId: {
        type: 'string',
        description: 'Course Id for sync',
      },
      userId: {
        type: 'string',
        description: 'userId for course',
      },
    },
  },
  create: {
    required: ['courseId', 'userId'],
  },
};

module.exports = schema;
