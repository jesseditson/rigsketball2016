import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['global-nav'],
  session: Ember.inject.service(),
  loggedIn: Ember.computed('session.user', function() {
    return !!this.get('session.user')
  }),
  actions: {
    logout() {
      this.get('session').logout()
      this.transitionTo('bracket')
    }
  }
});
