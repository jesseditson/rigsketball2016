import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('bracket', function() {
    this.route('round', { path: 'round/:id' });
  });
  this.route('signup');
  this.route('compilation-terms');
  this.route('login');
});

export default Router;
