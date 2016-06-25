var express = require("express")
var router = module.exports = express.Router()
var json2csv = require('json2csv')
var db = require('../lib/db')

const fields = [
  "name",
  "website",
  "bandcamp",
  "soundcloud",
  "phone",
  "email",
  "address",
  "member_count",
  "track_url",
  "image_url"
]

router.get('/download', (req, res, next) => {
  db('bands')
    .select('*')
    .then(bands => {
      bands = bands.reduce((o, b) => {
        o[b.name.toLowerCase().trim()] = b
        return o
      }, {})
      bands = Object.keys(bands).map(n => {
        return bands[n]
      })
      return new Promise((resolve, reject) => {
        json2csv({
          data: bands,
          fields: fields
        }, (err, csv) => {
          if (err) reject(err)
          res.set('Content-disposition', 'attachment; filename=bands.csv')
          res.set('Content-type', 'text/csv')
          res.send(csv)
        })
      })
    })
    .catch(next)
})
