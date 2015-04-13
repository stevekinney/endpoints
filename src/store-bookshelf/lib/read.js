const bPromise = require('bluebird');
const _ = require('lodash');

const allRelations = require('./all_relations');
const type = require('./type');

/**
 * Retrieves a collection of models from the database.
 *
 * @param {Bookshelf.Model} model - a bookshelf model class
 * @param {Object} opts - the output of Request#query
 * @param {Object} mode - the mode of the request (single/related/relation)
 * @return {Promise(Bookshelf.Collection)} Models that match the request.
*/
module.exports = function read (model, opts, mode) {
  // TODO: make different read methods for the mode, don't glom them all here
  if (!opts) {
    opts = {};
  }
  var ready = bPromise.resolve();
  var singleResult = mode === 'single' || (
    (mode === 'related' || mode === 'relation') &&
    !Array.isArray(opts.filter.id)
  );

  // populate the field listing for a table so we know which columns
  // we can use for sparse fieldsets.
  if (!model.columns) {
    ready = model.query().columnInfo().then(function (info) {
      model.prototype.columns = Object.keys(info);
    });
  }

  return ready.then(function () {
    var fields = opts.fields && opts.fields[type(model)];
    // this has to be done here because we can't statically analyze
    // the columns on a table yet.
    if (fields) {
      fields = _.intersection(model.columns, fields);
      // ensure we always select id as the spec requires this to be present
      if (!_.contains(fields, 'id')) {
        fields.push('id');
      }
    }

    return model.collection().query(function (qb) {
      qb = processFilter(model, qb, opts.filter);
      qb = processSort(model.columns, qb, opts.sort);
    }).fetch({
      // adding this in the queryBuilder changes the qb, but fetch still
      // returns all columns
      columns: fields,
      withRelated: _.intersection(allRelations(model), opts.include || [])
    }).then(function (result) {
      // This is a lot of gross in order to pass this data into the
      // formatter later. Need to formalize this in some other way.
      result.mode = mode;
      result.relations = opts.include;
      result.singleResult = singleResult;
      result.baseType = opts.baseType;
      result.baseId = opts.baseId;
      result.baseRelation = opts.baseRelation;
      return result;
    });
  });
};

function idFilter (qb, value) {
  return qb.whereIn('id', value);
}

function isAscending (key) {
  return key[0] === '+' || key[0] === ' ';
}

function processFilter (model, query, filterBy) {
  var filters = model.filters;
  return _.transform(filterBy, function (result, value, key) {
    var filter = filters[key];
    if (key === 'id' && !filter) {
      filter = idFilter;
    }
    return filter ? filter.call(filters, result, value) : result;
  }, query);
}

function processSort (validFields, query, sortBy) {
  return _.chain(sortBy).filter(function (key) {
    var hasSortDir = key[0] === ' ' || key[0] === '+' || key[0] === '-';
    var isValidField = _.contains(validFields, key.substring(1));
    return hasSortDir && isValidField;
  }).reduce(function (result, key) {
    var column = key.substring(1);
    var dir =  isAscending(key) ? 'ASC' : 'DESC';
    return column ? result.orderBy(column, dir) : result;
  }, query).value();
}
