const certificationCourseController = require('./certification-course-controller');
const connectedUserVerification = require('../../application/preHandlers/connected-user-verification');
const accessSessionHandler = require('../../application/preHandlers/access-session');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/certification-courses',
      config: {
        pre: [{
          method: connectedUserVerification.verifyByToken,
          assign: 'userId'
        },
        {
          method: accessSessionHandler.sessionIsOpened,
          assign: 'sessionOpened'
        }],
        handler: certificationCourseController.save,
        tags: ['api']
      }
    }, {
      method: 'GET',
      path: '/api/certification-courses/{id}/result',
      config: {
        handler: certificationCourseController.getResult,
        tags: ['api']
      }
    } , {
      method: 'GET',
      path: '/api/certification-courses/{id}',
      config: {
        handler: certificationCourseController.get,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'certification-courses-api',
  version: '1.0.0'
};
