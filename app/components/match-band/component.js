import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['match-band'],
  classNameBindings: ['bandClass'],
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  init() {
    this._super(...arguments)
    // // TODO: don't re-fetch these, perhaps inject at route level.
    // this.get('store').findAll('band').then(bands => {
    //   this.set('bands', bands)
    // })
  },
  bands: [],
  bandClass: Ember.computed('number', function() {
    var n = this.get('number')
    return `band${n}`
  }),
  band: Ember.computed('match', 'number', function() {
    var n = this.get('number')
    return this.get('match').get(`band${n}`)
  }),
  score: Ember.computed('number', function() {
    var n = this.get('number')
    return this.get('match').get(`band${n}_score`) || 0
  }),
  canEdit: Ember.computed('session.user', function() {
    return !!this.get('session.user')
  }),
  actions: {
    updateScore(score) {
      var model = this.get('match')
      var n = this.get('number')
      model.set(`band${n}_score`, score)
      model.save()
    },
    updateBand(band) {
      var model = this.get('match')
      var n = this.get('number')
      model.set(`band${n}`, band)
    }
  }
});
