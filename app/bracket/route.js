import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.RSVP.hash({
      rounds: this.store.findAll('round')
    });
  }
});
