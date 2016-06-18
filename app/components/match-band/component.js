import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['match-band'],
  classNameBindings: ['bandClass'],
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
  actions: {
    updateScore(score) {
      var model = this.get('match')
      var n = this.get('number')
      model.set(`band${n}_score`, score)
      model.save()
    }
  }
});
