import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    signedUp() {
      this.transitionToRoute('bracket')
    }
  }
});
