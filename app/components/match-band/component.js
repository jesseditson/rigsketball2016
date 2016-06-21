import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['match-band'],
  classNameBindings: ['bandClass'],
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  bandClass: Ember.computed('number', function() {
    var n = this.get('number')
    return `band${n}`
  }),
  band: Ember.computed('match.{band1,band2}', 'number', function() {
    var n = this.get('number')
    return this.get('match').get(`band${n}`)
  }),
  selectedBandId: Ember.computed('band', function() {
    return this.get('band.id')
  }),
  score: Ember.computed('number', function() {
    var n = this.get('number')
    return this.get('match').get(`band${n}_score`) || 0
  }),
  canEditScore: Ember.computed('session.user', function() {
    return !!this.get('session.user')
  }),
  canEdit: Ember.computed('round', 'session.user', function() {
    return this.get('round.id') === '1' && !!this.get('session.user')
  }),
  canSelect: Ember.computed('match.{band1,band2}', 'number', 'session.signingUpBand', function() {
    var n = this.get('number')
    return !this.get(`match.band${n}.id`) && this.get('session.signingUpBand')
  }),
  updateBand(band) {
    console.log(band)
    var model = this.get('match')
    var n = this.get('number')
    model.set(`band${n}`, band)
    return model.save()
  },
  actions: {
    updateScore(score) {
      var model = this.get('match')
      var n = this.get('number')
      model.set(`band${n}_score`, score)
      model.save()
    },
    updateBand(band) {
      this.updateBand(band)
    },
    chooseSpot() {
      var band = this.get('session.signingUpBand')
      this.updateBand(band)
        .then(() => {
          this.get('session').setSigningUpBand(null)
        })
    },
    clear() {
      this.updateBand(null)
    }
  }
});
