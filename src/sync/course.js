const { services, programTypes, allStatus } = require('../constants');


class CourseSync {
  constructor(app, id) {
    this.app = app;
    this.courseId = id;
    this.courseService = app.get(services.COURSE_SERVICE);
    this.examService = app.get(services.EXAM_SERVICE);
  }

  async getAllCourseRecords() {
    try {
      const { data: course } = await this.courseService.get(`/courses/${this.courseId}`);
      course.entityType = 'COURSE';
      const modules = await this.getModules();
      const moduleLessons = await this.getModuleLessons(modules.map(x => x.id));
      const scheduleGroups = await this.getSchedules();
      const allRecords = [course, ...modules, ...moduleLessons, ...scheduleGroups];
      return allRecords;
    } catch (e) {
      return [];
    }
  }

  async getModules(programType = programTypes.WORKING_PROGRAM) {
    try {
      const { data: modules } = await this.courseService.get(`/modules?courseId=${this.courseId}&programType=${programType}&limit=1000`);
      return modules.data.map(x => ({
        ...x,
        entityType: 'MODULE',
      }));
    } catch (e) {
      this.app.error(e);
      return [];
    }
  }

  async getModuleLessons(moduleIds, programType = programTypes.WORKING_PROGRAM) {
    try {
      const { data: moduleLessons } = await this.courseService.get('/module-lessons', {
        params: {
          courseId: this.courseId,
          programType,
          moduleIdIn: moduleIds,
          limit: 1000,
        },
      });
      return moduleLessons.data.map(x => ({
        ...x,
        entityType: 'MODULE_LESSON',
      }));
    } catch (e) {
      this.app.error(e);
      return [];
    }
  }

  async getSchedules() {
    try {
      const { data: scheduleGroups } = await this.courseService.get('/schedule-groups', {
        params: {
          courseId: this.courseId,
          showOnlyActive: true,
          status: allStatus.PUBLISHED,
          limit: 1000,
        },
      });
      return scheduleGroups.data.map(x => ({
        ...x,
        entityType: 'SCHEDULE_GROUP',
      }));
    } catch (e) {
      this.app.error(e);
      return [];
    }
  }
}

module.exports = CourseSync;
