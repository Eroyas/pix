import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | assessment-progress', function() {
  setupModelTest('assessment-progress', {
    needs: []
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('#stepPercentage', function() {
    it('should return the number of challenges for this assessment', function() {
      // given
      const currentStep = 1;
      const maxStep = 3;
      const progress = this.subject({ currentStep, maxStep });
      const expectedPercentage = (currentStep/maxStep)*100;

      // when
      const percentage = progress.get('stepPercentage');

      // then
      expect(percentage).to.equal(expectedPercentage);
    });
  });
});
