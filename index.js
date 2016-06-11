var express = require('express')
var emberServer = require('./server')

var app = module.exports = express()

var env = process.env.NODE_ENV || 'development'
app.locals.ENV = env
app.locals.ENV_DEVELOPMENT = env == 'development'
app.locals.package = pkgInfo

app.use(express.static(path.join(process.cwd(), 'dist')))
var indexFile = path.join(__dirname, 'dist/index.html')
app.use((req, res) => res.sendFile(indexFile))

emberServer(app)

app.serve = function() {
  this.set('port', this.get('port') || process.env.PORT || 80)
  this.set('host', this.get('host') || process.env.HOST || '0.0.0.0')

  var server = this.listen(this.get('port'), this.get('host'), function() {
    debug(`Server running on port ${server.address().port}`)
  })
  return server
}

// if called directly, just serve.
if (require.main === module) app.serve()
