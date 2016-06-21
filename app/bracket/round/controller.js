import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  canEdit: Ember.computed('session.user', function() {
    return !!this.get('session.user')
  })
});
