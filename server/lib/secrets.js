var secrets = {}
try {
  secrets = require('../../secrets.json')
} catch (e) {
  if (process.env.NODE_ENV === 'production') throw new Error('no secrets.json file found.')
}
module.exports = secrets
