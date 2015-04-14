const _ = require('lodash');

const modelHas = require('./model_has');

module.exports = function (method, config) {
  const model = config.model;
  const store = config.store;
  return _.compose(_.flatten, _.compact)([
    modelHas(store.allRelations(model), config.include, 'relations'),
    modelHas(store.filters(model), Object.keys(config.filter), 'filters'),
    // this is crap
    (method === 'read') ? null :
      modelHas(
        method === 'create' ? model : model.prototype,
        config.method,
        'method'
      )
  ]);
};
