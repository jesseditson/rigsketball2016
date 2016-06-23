import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  canEdit: Ember.computed('session.user', function() {
    return !!this.get('session.user')
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
      // console.log(idx, JSON.parse(JSON.stringify(matchInfo[idx])))
      match.info = matchInfo[match.get('index')]
      return match
    })
  }),
  actions: {
    saveMatch(match) {
      match.save()
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
    var info = [m]
    var matchIndex = m.get('index')
    while (roundIndex > 1) {
      roundIndex = Math.floor(roundIndex / 2)
      let nextRound = roundMap[roundIndex]
      if (!nextRound) break
      var nextMatchIndex = Math.ceil(matchIndex / 2) - 1
      match = nextRound.get('matches').objectAt(nextMatchIndex)
      info.push(match)
    }
    o[matchIndex] = info
    return o
  }, {})
  return matchInfo
}
