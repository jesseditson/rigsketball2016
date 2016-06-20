import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return Ember.RSVP.hash({
      round: this.store.findRecord('round', params.id),
      bands: this.store.findAll('band')
    })
  }
});
