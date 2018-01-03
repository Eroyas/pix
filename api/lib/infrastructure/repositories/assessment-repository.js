const BookshelfAssessment = require('../../domain/models/data/assessment');
const Assessment = require('../../domain/models/Assessment');
const { groupBy, map, head, _ } = require('lodash');

function _selectLastAssessmentForEachCourse(assessments) {
  const assessmentsGroupedByCourse = groupBy(assessments.models, (assessment) => assessment.get('courseId'));
  return map(assessmentsGroupedByCourse, head);
}

function _toDomain(bookshelfAssessment) {
  const modelObjectInJSON = bookshelfAssessment.toJSON();
  return new Assessment(modelObjectInJSON);
}

function _adaptModelToDb(assessment) {
  return _.omit(assessment, ['answers', 'successRate']);
}

module.exports = {
  get(id) {
    return BookshelfAssessment
      .where('id', id)
      .fetch({ withRelated: ['answers'] })
      .then(_toDomain);
  },

  findCompletedAssessmentsByUserId(userId) {
    return BookshelfAssessment
      .query(qb => {
        qb.where({ userId });
        qb.whereNot('courseId','LIKE','null%');
        qb.whereNotNull('estimatedLevel');
        qb.whereNotNull('pixScore');
        qb.andWhere(function() {
          this.where({ type: null })
            .orWhereNot({ type: 'CERTIFICATION' });
        });
      })
      .fetchAll()
      .then(assessments => assessments.models)
      .then((assessments) => _.map(assessments, (assessment) => _toDomain(assessment)));
  },

  findLastAssessmentsForEachCoursesByUser(userId) {

    return BookshelfAssessment
      .collection()
      .query(qb => {
        qb.select()
          .where({ userId })
          .andWhere(function() {
            this.where({ type: null })
              .orWhereNot({ type: 'CERTIFICATION' });
          })
          .whereNot('courseId','LIKE','null%')
          .orderBy('createdAt', 'desc');
      })
      .fetch()
      .then(_selectLastAssessmentForEachCourse)
      .then((assessments) => _.map(assessments, (assessment) => _toDomain(assessment)));
  },

  findLastCompletedAssessmentsForEachCoursesByUser(userId) {
    return BookshelfAssessment
      .collection()
      .query(qb => {
        qb.where({ userId })
          .whereNotNull('estimatedLevel')
          .whereNotNull('pixScore')
          .andWhere(function() {
            this.where({ type: null })
              .orWhereNot({ type: 'CERTIFICATION' });
          })
          .orderBy('createdAt', 'desc');
      })
      .fetch()
      .then(_selectLastAssessmentForEachCourse)
      .then((assessments) => _.map(assessments, (assessment) => _toDomain(assessment)));
  },

  getByUserIdAndAssessmentId(assessmentId, userId) {
    return BookshelfAssessment
      .query({ where: { id: assessmentId }, andWhere: { userId } })
      .fetch({ require: true })
      .then(_toDomain);
  },

  save(assessment) {
    const assessmentBookshelf = new BookshelfAssessment(_adaptModelToDb(assessment));

    return assessmentBookshelf.save().then(_toDomain);
  },

  getByCertificationCourseId(certificationCourseId) {
    return BookshelfAssessment
      .where({ courseId: certificationCourseId })
      .fetch()
      .then(_toDomain);
  }
};
