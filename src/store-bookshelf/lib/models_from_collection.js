/**
 * Return models from a collection.
 *
 * @param {Bookshelf.Collection} collection
 * @return {Array}
 */
module.exports = function modelsFromCollection (collection) {
  return collection.models;
};
