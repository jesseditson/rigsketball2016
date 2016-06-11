var express = require('express')
var router = module.exports = express.Router()
var db = require('../lib/db')
var toJSONAPI = require('../lib/JSONAPI')('/api')

router.get('/', (req, res, next) => {
  db('rounds')
    .select('*')
    .then(rounds => {
      return db('matches')
        .select('*')
        .whereIn('round_id', rounds.map(r => r.id))
        .then(matches => {
          var matchMap = matches.reduce((o, m) => {
            var rid = m.round_id
            if (!o[rid]) o[rid] = []
            o[rid].push(m)
            return o
          }, {})
          return rounds.map(r => {
            r.relationships = { matches: matchMap[r.id] }
            return r
          })
        })
    })
    .then(rounds => {
      res.json(toJSONAPI('rounds', rounds))
    })
    .catch(next)
})

router.get('/:id/relationships/matches', (req, res, next) => {
  var roundId = req.params.id
  db('rounds')
    .select('*')
    .where('id', roundId)
    .then(round => {
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
          console.log(bandIds)
          if (!bandIds.length) {
            // if there are no bands, break early
            round.relationships = { matches: matches }
            return round
          }
          return db('bands')
            .select('*')
            .whereIn('id', bandIds)
            .then(bands => {
              var bandMap = bands.reduce((o, b) => {
                o[b.id] = b
                return o
              }, {})
              round.relationships = {
                matches: matches.map(m => {
                  m.relationships = {
                    band1: bandMap[m.band1_id],
                    band2: bandMap[m.band2_id]
                  }
                  return m
                })
              }
              return round
            })
        })
    })
    .then(round => {
      res.json(toJSONAPI('rounds', round))
    })
    .catch(next)
})
