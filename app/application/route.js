import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('match', { round_id: 1 })
  },
  actions: {
    logout() {
      this.transitionTo('index')
    }
  }
});
