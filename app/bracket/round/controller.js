import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  canEdit: Ember.computed('session.user', function() {
    return !!this.get('session.user')
  }),
  infoOpen: false,
  showRoundInfo: Ember.computed('selectingSpot', 'canEdit', 'infoOpen', function() {
    return this.get('infoOpen') || this.get('selectingSpot') || this.get('canEdit')
  }),
  selectingSpot: Ember.computed('session.signingUpBand.id', function() {
    return !!this.get('session.signingUpBand.id')
  }),
  showMatchInfo: false,
  matchesWithInfo: Ember.computed('model.rounds', 'model.round', function() {
    var matchInfo = fullMatchInfo(this.get('model.rounds'))
    var matches = this.get('model.rounds').find(r => {
      return r.get('id') === this.get('model.round.id')
    }).get('matches').sortBy('time')
    return matches.map((match) => {
      var idx = match.get('index')
      match.info = matchInfo[match.get('index')]
      return match
    })
  }),
  actions: {
    saveMatch(match) {
      match.save()
    },
    toggleInfo() {
      this.set('infoOpen', !this.get('infoOpen'))
    }
  }
});

function fullMatchInfo(rounds) {
  var roundMap = {}
  var firstRoundIndex = 0
  rounds.forEach(round => {
    let index = round.get('index')
    if (index > firstRoundIndex) firstRoundIndex = index
    roundMap[index] = round
  })
  var matches = roundMap[firstRoundIndex].get('matches')
  var matchInfo = matches.reduce((o, m, i) => {
    var match = m
    var roundIndex = firstRoundIndex
    var info = []
    var currentMatchIndex
    var matchIndex = currentMatchIndex = m.get('index')
    while (roundIndex > 1) {
      let nextRound = roundMap[roundIndex]
      match = nextRound.get('matches').findBy('index', currentMatchIndex)
      info.push(match)
      roundIndex = Math.floor(roundIndex / 2)
      currentMatchIndex = Math.ceil(currentMatchIndex / 2)
    }
    o[matchIndex] = info
    return o
  }, {})
  return matchInfo
}
