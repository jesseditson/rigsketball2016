import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return Ember.RSVP.hash({
      rounds: this.store.findAll('round').then(r => {
        return Ember.RSVP.all(r.getEach('matches')).then(matches => {
          return r;
        })
      }),
      round: this.store.findRecord('round', params.id),
      bands: this.store.findAll('band')
    })
  }
});
