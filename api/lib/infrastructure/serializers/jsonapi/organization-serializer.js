const { Serializer } = require('jsonapi-serializer');
const Organization = require('../../../domain/models/data/organization');

module.exports = {

  serialize(organizations) {
    return new Serializer('organizations', {
      attributes: ['name', 'type', 'email', 'code', 'user'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName', 'email'],
        included: true,
      },
      transform(record) {
        return Object.assign({}, record.toJSON());
      }
    }).serialize(organizations);
  },

  deserialize(json) {
    return new Organization({
      email: json.data.attributes.email,
      type: json.data.attributes.type,
      name: json.data.attributes.name,
    });
  }

};
