const User = require('../../../lib/domain/models/data/user');

const encrypt = require('../../domain/services/encryption-service');
const tokenService = require('../../domain/services/token-service');

const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

const Authentication = require('../../domain/models/data/authentication');
const authenticationSerializer = require('../../infrastructure/serializers/jsonapi/authentication-serializer');

module.exports = {
  save(request, reply) {

    let user;
    const { password, email } = _extractAttributes(request);

    return new User({ email })
      .fetch()
      .then(foundUser => {

        if (foundUser === null) {
          return Promise.reject();
        }

        user = foundUser;
        return encrypt.check(password, foundUser.get('password'));
      })
      .then(_ => {
        const token = tokenService.createTokenFromUser(user);

        const authentication = new Authentication(user.get('id'), token);
        return reply(authenticationSerializer.serialize(authentication)).code(201);
      })
      .catch(() => {
        const message = validationErrorSerializer.serialize(_buildError());
        reply(message).code(400);
      });
  }
};

function _extractAttributes(request) {
  return request.payload.data.attributes;
}

function _buildError() {
  return {
    data: {
      '': [ 'L\'adresse e-mail et/ou le mot de passe saisi(s) sont incorrects.' ]
    }
  };
}
