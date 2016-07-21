import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return Ember.RSVP.hash({
      rounds: this.store.findAll('round')
    })
  },
  redirect(model) {
    this.transitionTo('bracket.round', 1)
  }
});
