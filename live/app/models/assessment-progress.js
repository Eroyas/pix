import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr, Model } = DS;

export default Model.extend({

  currentStep: attr('number'),
  maxStep: attr('number'),
  stepPercentage: computed('currentStep', 'maxStep', function() {
    return this.get('currentStep') / this.get('maxStep') * 100;
  })

});
