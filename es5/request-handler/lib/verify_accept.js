'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _Kapow = require('kapow');

var _Kapow2 = _interopRequireWildcard(_Kapow);

var EXPECTED_ACCEPT = 'application/vnd.api+json';

exports['default'] = function (request) {
  var err;

  var headers = request.headers;
  var accept = headers.accept;
  var isBrowser = accept && accept.indexOf('text/html') !== -1;

  var isValidAccept = accept && accept.toLowerCase().indexOf(EXPECTED_ACCEPT) === 0;

  if (!isValidAccept && !isBrowser) {
    err = _Kapow2['default'](406, 'Content-Type must be "' + EXPECTED_ACCEPT + '"');
  }

  return err;
};

module.exports = exports['default'];