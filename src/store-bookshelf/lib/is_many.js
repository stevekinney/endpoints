/**
 * Return true if the supplied input is a collection.
 *
 * @param {Bookshelf.Model|Bookshelf.Collection} input
 * @return {Boolean}
 */
module.exports = function isMany (input) {
  return !!input.models;
};
