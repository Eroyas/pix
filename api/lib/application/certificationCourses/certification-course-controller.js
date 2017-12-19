const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const CertificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const CertificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const userService = require('../../../lib/domain/services/user-service');
const certificationChallengesService = require('../../../lib/domain/services/certification-challenges-service');
const certificationService = require('../../domain/services/certification-service');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const CertificationCourse = require('../../../lib/domain/models/CertificationCourse');

module.exports = {
  save(request, reply) {
    const userId = request.pre.userId;
    let certificationCourse = new CertificationCourse({ userId, status: 'started' });

    return CertificationCourseRepository.save(certificationCourse)
      .then((savedCertificationCourse) => {
        return certificationCourse = savedCertificationCourse;
      })
      .then(() => userService.getProfileToCertify(userId))
      .then((userProfile) => certificationChallengesService.saveChallenges(userProfile, certificationCourse))
      .then(() => reply(CertificationCourseSerializer.serialize(certificationCourse)).code(201))
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  getResult(request, reply) {
    const certificationCourseId = request.params.id;

    return certificationService.getCertificationResult(certificationCourseId)
      .then(reply)
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  get(request, reply) {
    const certificationCourseId = request.params.id;
    return CertificationCourseRepository.get(certificationCourseId)
      .then((certificationCourse) => {
        reply(certificationCourseSerializer.serialize(certificationCourse));
      })
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  }

};
