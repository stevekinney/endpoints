'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _Kapow = require('kapow');

var _Kapow2 = _interopRequireWildcard(_Kapow);

exports['default'] = function (model) {
  if (model) {
    throw _Kapow2['default'](409, 'Model with this ID already exists');
  }
  return model;
};

module.exports = exports['default'];