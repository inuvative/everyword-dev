/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/media', require('./api/media'));
  app.use('/api/references', require('./api/reference'));
  app.use('/api/remarks', require('./api/remark'));
  app.use('/api/footnotes', require('./api/footnote'));
  app.use('/api/biblesvc', require('./api/biblesvc'));
  app.use('/api/messages', require('./api/message'));
  app.use('/api/tags', require('./api/tag'));
  app.use('/api/groups', require('./api/group'));
  app.use('/api/annotations', require('./api/annotation'));
  app.use('/api/comments', require('./api/comment'));
  app.use('/api/homebases', require('./api/homebase'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
