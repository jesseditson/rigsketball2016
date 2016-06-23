import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    showBracket() {
      this.transitionTo('bracket');
    }
  }
});
