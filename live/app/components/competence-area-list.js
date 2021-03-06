import Ember from 'ember';
import groupBy from 'ember-group-by';
import _sortBy from 'lodash/sortBy';

export default Ember.Component.extend({

  classNames: ['competence-area-list'],

  competences: null,

  _sanitizedCompetences: Ember.computed('competences', function() {
    const _competences = this.get('competences');
    return _competences ? _competences : [];
  }),

  _competencesGroupedByArea: groupBy('_sanitizedCompetences', 'areaName'),

  _competencesByAreaSorted: Ember.computed('_competencesGroupedByArea', function() {
    const competencesByArea = this.get('_competencesGroupedByArea');
    return _sortBy(competencesByArea, (competence) => competence.value);
  }),
});
