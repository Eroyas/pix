import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  maxStep: 25,

  currentStep() {
    return faker.random.number({ min: 1, max: this.maxStep });
  }
});
