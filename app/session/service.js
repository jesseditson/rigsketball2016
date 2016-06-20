import Ember from 'ember';

const cookieName = 'rigsketball-token';

export default Ember.Service.extend({
  ajax: Ember.inject.service(),
  cookies: Ember.inject.service(),
  token: null,
  init() {
    this._super(...arguments)
    var token = this.get('cookies').read(cookieName)
    this.set('token', token)
  },
  login(email, password) {
    return this.get('ajax').post('/api/authenticate', {
      data: {
        email: email,
        password: password
      }
    }).then(info => {
      this.set('token', info.token)
      this.get('cookies').write(cookieName, info.token)
    })
  }
});
