var morgan = require('morgan');
var bodyParser = require('body-parser');

module.exports = function(app) {
  // var globSync   = require('glob').sync;
  // var mocks      = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
  // var proxies    = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require);

  // Logging
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: true }))
  // Support for jsonAPI header
  app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

  // Ping and version endpoints
  app.all('/ping', (req, res) => res.send('PONG'))
  app.all('/version', (req, res) => res.send(pkg.version))

  app.use('/api', require('./api'))

  /**
   * API Error Handler
   */
  app.use('/api', (err, req, res, next) => {
    console.log(err.stack)
    res.status(err ? 500 : 404).json({
      error: err ? err.message : 'Not Found'
    })
  })

  // mocks.forEach(function(route) { route(app); });
  // proxies.forEach(function(route) { route(app); });

};
