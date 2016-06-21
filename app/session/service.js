import Ember from 'ember';

const tokenCookieName = 'rigsketball-token';
const signupCookieName = 'rigsketball-signup';

export default Ember.Service.extend({
  ajax: Ember.inject.service(),
  cookies: Ember.inject.service(),
  store: Ember.inject.service(),
  token: null,
  signingUpBand: null,
  user: null,
  clearCookie(name) {
    return this.get('cookies').write(name, '', { expires: new Date('1970-01-01'), path: '/' });
  },
  init() {
    this._super(...arguments)
    var c = this.get('cookies')
    this.set('token', c.read(tokenCookieName))
    var signingUpId = c.read(signupCookieName)
    if (!isNaN(parseInt(signingUpId))) {
      this.get('store').findRecord('band', signingUpId)
        .then(band => {
          this.set('signingUpBand', band)
        })
    }
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
  setSigningUpBand(band) {
    if (!!band) {
      this.get('cookies').write(signupCookieName, band.get('id'), { path: '/' })
      this.set('signingUpBand', band)
    } else {
      this.clearCookie(signupCookieName)
      this.set('signingUpBand', null)
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
      this.get('cookies').write(tokenCookieName, info.token, { path: '/' })
      this.refreshUser()
    })
  },
  logout() {
    this.set('token', null)
    this.clearCookie(tokenCookieName)
    this.refreshUser()
  }
});
