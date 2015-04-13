/**
 * Return the provided model as JSON. We specify shallow here so
 * that relations are not automatically nested in the response.
 *
 * @param {Bookshelf.Model} model
 * @return {Object}
 */
module.exports = function serialize (model) {
  return model.toJSON({shallow:true});
};
