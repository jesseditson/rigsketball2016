import Ember from 'ember';

const tokenCookieName = 'rigsketball-token';
const signupCookieName = 'rigsketball-signup';

export default Ember.Service.extend({
  ajax: Ember.inject.service(),
  cookies: Ember.inject.service(),
  token: null,
  signingUp: null,
  user: null,
  clearCookie(name) {
    this.get('cookies').write(name, null, { expires: new Date('1970-01-01') });
  },
  init() {
    this._super(...arguments)
    var c = this.get('cookies')
    this.set('signing-up', c.read(signupCookieName))
    this.set('token', c.read(tokenCookieName))
    this.refreshUser()
  },
  refreshUser() {
    var token = this.get('token')
    if (!token) return
    return this.get('ajax').request('/api/verify', {
      data: { token: token }
    }).then(user => {
      this.set('user', user)
    }).catch(err => {
      this.set('user', null)
    })
  },
  setSigningUp(value) {
    if (!!value) {
      this.get('cookies').write(signupCookieName, true)
    } else {
      this.clearCookie(signupCookieName)
    }
  },
  login(email, password) {
    return this.get('ajax').post('/api/authenticate', {
      data: {
        email: email,
        password: password
      }
    }).then(info => {
      this.set('token', info.token)
      this.get('cookies').write(tokenCookieName, info.token)
      this.refreshUser()
    })
  },
  logout() {
    this.set('token', null)
    this.clearCookie(tokenCookieName)
    this.refreshUser()
  }
});
