var express = require('express')
var router = module.exports = express.Router()
var db = require('../lib/db')
var toJSONAPI = require('../lib/JSONAPI')('/api')

router.get('/', (req, res, next) => {
  db('rounds')
    .select('*')
    .map(round => {
      // TODO: we should only be creating links here, and letting ember assemble the relationships - but need to make matches do the same, etc if we do that.
      return getMatchesByRound(round.id)
        .then(matches => {
          console.log(matches)
          round.relationships = { matches: matches }
          return round
        })
    })
    .then(rounds => {
      res.json(toJSONAPI('rounds', rounds))
    })
    .catch(next)
})

function getMatchesByRound(roundId) {
  return db('matches')
    .select('*')
    .where('round_id', roundId)
    .then(matches => {
      var bandIds = matches
        .reduce((a, m) => {
          a.push(m.band1_id)
          a.push(m.band2_id)
          return a
        }, [])
        .filter(b => !!b || b === 0)
      return db('bands')
        .select('*')
        .whereIn('id', bandIds)
        .then(bands => {
          var bandMap = bands.reduce((o, b) => {
            o[b.id] = { type: 'bands', value: b }
            return o
          }, {})
          return matches.map(m => {
            m.relationships = {
              band1: bandMap[m.band1_id],
              band2: bandMap[m.band2_id]
            }
            return m
          })
        })
    })
}

function getRoundById(roundId) {
  return db('rounds')
    .select('*')
    .where('id', roundId)
    .first()
    .then(round => {
      return [round, getMatchesByRound(round.id)]
    })
    .spread((round, matches) => {
      round.relationships = { matches: matches }
      return round
    })
}

router.get('/:id', (req, res, next) => {
  getRoundById(req.params.id)
    .then(round => {
      res.json(toJSONAPI('rounds', round))
    })
    .catch(next)
})

router.get('/:id/matches', (req, res, next) => {
  getMatchesByRound(req.params.id)
    .then(matches => {
      res.json(toJSONAPI('matches', matches))
    })
    .catch(next)
})
