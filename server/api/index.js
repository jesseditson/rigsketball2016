var express = require('express')
var router = module.exports = express.Router()
var db = require('../lib/db')
var Promise = require('bluebird')
var JSONAPI = require('jsonapi-express')
var JSONAPIOperations = require('../lib/JSONAPIOperations')
var auth = require('./auth')
var signS3 = require('./sign-s3')
var download = require('./download')

JSONAPIOperations.sideEffects = {
  matches: {
    update: {
      records(info) {
        return recalculateMatches().then(() => info)
      }
    }
    // TODO: sort matches and relationships to matches by index.
  }
}

JSONAPIOperations.authorize = auth.middleware

router.use(signS3)
router.use(auth)

router.use('/', JSONAPI(JSONAPIOperations, '/api'))

router.use('/', download)

router.get('/recalculate-matches', (req, res, next) => {
  recalculateMatches()
    .then(operations => {
      res.status(201).json({ message: `updated ${operations.length} records.`})
    })
})

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

function recalculateMatches() {
  return db('rounds')
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
      Object.keys(rounds)
        .sort((a, b) => parseInt(a, 10) < parseInt(b, 10) ? 1 : -1)
        .forEach(index => {
          var round = rounds[index]
          var roundMatches = round.matches
          var nextRound = index / 2
          roundMatches.sort((a, b) => a.index < b.index ? -1 : 1).forEach(m => {
            if (!rounds[nextRound]) return
            var winner = getWinner(m)
            var nextMatch = rounds[nextRound].matches.find(nm => nm.index === Math.ceil(m.index / 2))
            var bandPos = m.index % 2 ? 'band1_id' : 'band2_id'
            operations.push(
              db('matches')
                .update({ [bandPos]: winner || null })
                .where({ id: nextMatch.id })
            )
            nextMatch[bandPos] = winner
          })
        })
      return Promise.all(operations)
    })
}
