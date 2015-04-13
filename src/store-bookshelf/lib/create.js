const _ = require('lodash');
const bPromise = require('bluebird');

const destructure = require('./destructure');

module.exports = function create (model, method, params) {
  if (!model) {
    throw new Error('No model provided.');
  }
  if (!method) {
    throw new Error('No method provided to create with.');
  }
  if (!params) {
    params = {};
  }
  if (!model.create) {
    model.create = baseCreate;
  }
  if (!model.prototype.update) {
    model.prototype.update = baseUpdate;
  }
  return destructure(model.forge(), params).then(function(destructured) {
    return model[method](
      destructured.data,
      destructured.toManyRels
    );
  });
};


// FIXME: the stuff below is gross. upstream to bookshelf... or something.

function baseCreate (params, toManyRels) {
  // this should be in a transaction but we don't have access to it yet
  return this.forge(params).save(null, {method: 'insert'}).tap(function (model) {
    return bPromise.map(toManyRels, function(rel) {
      return model.related(rel.name).attach(rel.id);
    });
  }).then(function(model) {
    return this.forge({id:model.id}).fetch();
  }.bind(this));
}

function baseUpdate (params, toManyRels, previous) {
  const clientState = _.extend(previous, params);
  return this.save(params, {patch: true, method: 'update'}).tap(function (model) {
    return bPromise.map(toManyRels, function(rel) {
      return model.related(rel.name).detach().then(function() {
        return model.related(rel.name).attach(rel.id);
      });
    });
  }).then(function(model) {
    // Bookshelf .previousAttributes() doesn't work
    // See: https://github.com/tgriesser/bookshelf/issues/326#issuecomment-76637186
    if (_.isEqual(model.toJSON({shallow: true}), clientState)) {
      return null;
    }
    return model;
  });
}
