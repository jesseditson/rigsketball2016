import Ember from 'ember';

export default Ember.Route.extend({
  redirect(model) {
    this.transitionTo('bracket.round', 1)
  }
});
