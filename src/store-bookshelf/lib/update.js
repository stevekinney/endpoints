const destructure = require('./destructure');
const serialize = require('./serialize');

/**
 * Updates a model.
 *
 * @param {Bookshelf.Model} model - A bookshelf model instance
 * @param {String} method - The method on the model instance to use when updating.
 * @param {Object} params - An object containing the params from the request.
 * @returns {Promise(Bookshelf.Model)} The updated model.
 */
module.exports = function update (model, method, params) {
  if (!method) {
    throw new Error('No method provided to update with.');
  }
  return destructure(model, params).then(function(destructured) {
    return model[method](
      destructured.data,
      destructured.toManyRels,
      serialize(model)
    );
  });
};
