import JSONAPIAdapter from 'ember-data/adapters/json-api';

export default JSONAPIAdapter.extend({
  session: Ember.inject.service(),
  namespace: 'api',
  headers: Ember.computed('session.token', function() {
    return {
      "x-access-token": this.get("session.token")
    };
  })
});
