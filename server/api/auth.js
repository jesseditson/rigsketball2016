var express = require('express')
var router = module.exports = express.Router()
var db = require('../lib/db')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
var secrets = require('../lib/secrets')

router.get('/verify', (req, res, next) => {
  var token = req.query.token
  if (!token) return res.status(406).json({ error: 'invalid params' })
  jwt.verify(token, secrets.jwt_secret, (err, user) => {
    if (err) return next(err)
    if (!user) return res.status(401).json({ error: 'invalid token' })
    res.json(user)
  })
})

router.post('/authenticate', (req, res, next) => {
  db('users')
    .select('*')
    .where({
      email: req.body.email
    })
    .first()
    .then(u => {
      if (!u) {
        return res.status(401).send({
          success: false,
          message: 'User not found.'
        });
      }
      bcrypt.compare(req.body.password, u.password, function(err, ok) {
        if (err) return next(err)
        if (!ok) {
          return res.status(401).send({
            success: false,
            message: 'Invalid password.'
          });
        }
        var token = jwt.sign(u, secrets.jwt_secret)
        res.json({
          success: true,
          token: token
        })
      })
    })
    .catch(next)
})

module.exports.middleware = function(req, res, next) {
  // allow public access for get requests
  if (req.method === 'GET') return next()
  // allow bands to sign up and choose a spot
  if (req.method === 'POST' && /^\/bands/.test(req.path)) return next()
  if (req.method === 'PATCH' && /^\/matches/.test(req.path)) return next()
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, secrets.jwt_secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.user = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
}
