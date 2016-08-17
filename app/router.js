import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {

  this.route('index', { path: '/' });
  this.route('home');
  this.route('preferences');
  this.route('assessment-create', { path: '/course/:id_course/create_assessment' });
  this.route('challenge-show', { path: '/challenges/:id_challenge' });
  this.route('people');
  this.route('challenges.preview', { path: '/challenges/:challenge_id/preview' });
  this.route('courses.course-preview', { path: '/courses/:course_id/preview' });
  this.route('courses.challenge-preview', { path: '/courses/:course_id/preview/challenges/:challenge_id' });

});

export default Router;
