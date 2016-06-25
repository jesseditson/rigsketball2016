import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['global-nav'],
  session: Ember.inject.service(),
  loggedIn: Ember.computed('session.user', function() {
    return !!this.get('session.user')
  }),
  canSignUp: Ember.computed('matches', function() {
    // TODO: something like the below (which fails right now) to see if all the slots are full:
    /**
     * !this.get('matches').every(m => {
         console.log(m.get('index'))
         console.log(m.get('band1.id'), m.get('band2.id'))
         return m.get('band1.id') && m.get('band2.id')
       })
     */
    return false
  }),
  actions: {
    logout() {
      this.get('session').logout()
      window.location = '/bracket'
    }
  }
});
