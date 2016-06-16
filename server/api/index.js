var express = require('express')
var router = module.exports = express.Router()
var db = require('../lib/db')
var Promise = require('bluebird')
var JSONAPI = require('jsonapi-express')
var JSONAPIOperations = require('../lib/JSONAPIOperations')

router.use('/', JSONAPI(JSONAPIOperations, '/api'))

const winning_score = 15
function getWinner(round) {
  var b1s = round.band1_score
  var b2s = round.band2_score
  if (!b1s && b1s !== 0) return null
  if (!b2s && b2s !== 0) return null
  if (b1s === b2s) return false
  if (b1s < winning_score && b2s < winning_score) return false
  return b1s > b2s ? round.band1_id : round.band2_id
}

router.get('/recalculate-matches', (req, res, next) => {
  db('rounds')
    .select('*')
    .then(rounds => {
      return rounds.reduce((o, r) => {
        o[r.id] = r
        return o
      }, {})
    })
    .then(rounds => {
      return db('matches')
        .select('*')
        .then(matchArr => {
          return matchArr.reduce((o, m) => {
            var roundId = m.round_id
            var round = rounds[roundId]
            var ri = round.index
            if (!o[ri]) {
              o[ri] = round
              o[ri].matches = []
            }
            o[ri].matches.push(m)
            return o
          }, {})
        })
    })
    .then(rounds => {
      var operations = []
      for (var index in rounds) {
        var round = rounds[index]
        var roundMatches = round.matches
        var nextRound = index / 2
        roundMatches.forEach(m => {
          if (!rounds[nextRound]) return
          var winner = getWinner(m)
          var nextMatch = rounds[nextRound].matches[Math.ceil(m.index / 2) - 1]
          var bandPos = m.index % 2 ? 'band1_id' : 'band2_id'
          operations.push(
            db('matches')
              .update({ [bandPos]: winner || null })
              .where({ id: nextMatch.id })
          )
          nextMatch[bandPos] = winner
        })
      }
      return Promise.all(operations)
    })
    .then(operations => {
      res.status(201).json({ message: `updated ${operations.length} records.`})
    })
})
