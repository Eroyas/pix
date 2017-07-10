const { expect, knex } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');

const User = require('../../../../lib/domain/models/data/user');
const UserRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Repository | UserRepository', function() {

  describe('#findUserById', () => {
    const userPassword = bcrypt.hashSync('A124B2C3#!', 1);
    let userId;
    const inserted_user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: userPassword,
      cgu: true
    };

    it('should be a function', function() {
      // then
      expect(UserRepository.findUserById).to.be.a('function');
    });

    describe('Success management', () => {
      before(function(done) {
        knex('users').delete().then(() => {
          knex('users').insert(inserted_user).then((result) => {
            userId = result.shift();
            done();
          });
        });
      });

      after(function(done) {
        knex('users').delete().then(() => {
          done();
        });
      });

      it('should find a user by provided id', () => {
        return UserRepository.findUserById(userId)
          .then((foundedUser) => {
            expect(foundedUser).to.exist;
            expect(foundedUser).to.be.an('object');
            expect(foundedUser.attributes.email).to.equal(inserted_user.email);
            expect(foundedUser.attributes.firstName).to.equal(inserted_user.firstName);
            expect(foundedUser.attributes.lastName).to.equal(inserted_user.lastName);
          });
      });

      it('should handle a rejection, when user id is not found', () => {
        const inexistenteId = 10093;
        return UserRepository.findUserById(inexistenteId)
          .catch((err) => {
            expect(err).to.be.an.instanceof(User.NotFoundError);
          });
      });
    });

  });
});