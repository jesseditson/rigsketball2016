import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['global-nav'],
  session: Ember.inject.service(),
  loggedIn: Ember.computed('session.user', function() {
    return !!this.get('session.user')
  }),
  canSignUp: Ember.computed('matches', function() {
    return this.get('matches').every(m => {
      return m.get('band1_id') && m.get('band2_id')
    })
  }),
  actions: {
    logout() {
      this.get('session').logout()
      window.location = '/bracket'
    }
  }
});
