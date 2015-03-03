const _ = require('lodash');
const splitStringProps = require('./split_string_props');

module.exports = function (request, opts) {
  var query = request.query || {};
  var include = query.include;
  var filter = query.filter;
  var fields = query.fields;
  var sort = query.sort;

  return {
    include: include ? include.split(',') : opts.include,
    // todo: normalize true/false strings to booleans here
    filter: _.extend((filter ? splitStringProps(filter) : opts.filter), request.params),
    fields: fields ? splitStringProps(fields) : opts.fields,
    sort: sort ? sort.split(',') : opts.sort
  };
};
