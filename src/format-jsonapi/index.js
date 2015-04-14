/**
 * Generate JSON API compatible response objects from any data.
 */
class JsonApiFormat {

  /**
   * The constructor.
   *
   * @constructs JsonApi
   * @param {Object} opts - configuration options
   * @param {Object} opts.store - the store to extract data with
   * @param {Object} opts.baseUrl - the baseUrl for hypermedia links
   */
  constructor(opts={}) {
    if (!opts.store) {
      throw new Error('No store specified.');
    }
    this.store = opts.store;
    this.baseUrl = opts.baseUrl || '';
  }

  /**
   * Generate JSON API compatible response objects from any data source
   * using the provided store.
   *
   * @param {*} input - the input data
   * @param {Array} includedRelations - an array of relation names to sideload
   * @param {Boolean} singleResult - indicate if data should be singular
   */
  process (input, includedRelations=[], singleResult=false) {
    const store = this.store;
    let data = [];
    let rawIncludes = [];
    let includedIndex = [];
    if (this.store.isMany(input)) {
      input.forEach((input) => {
        const result = this.format(input, includedRelations);
        data.push(result.data);
        rawIncludes = rawIncludes.concat(result.included);
      });
    } else {
      const result = this.format(input, includedRelations);
      data = result.data;
      rawIncludes = result.included;
    }
    // format the records to be included and ignore duplicates
    const included = rawIncludes.reduce((result, model) => {
      const indexKey = `${store.id(model)}${store.type(model)}`;
      const skip = includedIndex.some((entry) => entry == indexKey);
      if (!skip) {
        // TODO: interlink these by logging which relation
        // each included model came from and then passing in
        // all included relations that are subrelations of it
        result.push(this.format(model).data);
        includedIndex.push(indexKey);
      }
      return result;
    }, []);

    if (singleResult && Array.isArray(data)) {
      data = data.length ? data[0] : null;
    }

    return included.length ? { data, included } : { data };
  }

  /**
   * Format a model to JSON-API compliance and extract any related models
   * that should be sideloaded (included).
   *
   * @param {*} model - a model
   * @param {Array} includedRelations - an array of relation names to sideload
   * @return {Object}
   */
  format(model, includedRelations=[]) {
    const store = this.store;
    // get all relations on the model
    const allRelations = store.allRelations(model);
    // get all toOne relations on the model
    const toOneRelations = store.toOneRelations(model);
    // get all relations for this model that weren't sideloaded (included)
    const linkedRelations = allRelations.filter((relation) => {
      includedRelations.indexOf(relation) === -1;
    });
    // build a links object for this model and get sideloaded (included) models
    const {links, included} =
      this.link(model, includedRelations, linkedRelations);
    // start json-api compatible serialization
    const data = store.serialize(model);
    // remove to-one foreign key attributes, they will appear in links
    for (let rel in toOneRelations) {
      delete data[toOneRelations[rel]];
    }
    // ensure required json-api fields are present
    data.id = String(store.id(model));
    data.type = store.type(model);
    data.links = links;
    // return the serialized model and all included models
    return { data, included };
  }

  /**
   * Generate self-referencing url.
   *
   * @param {*} model - a model
   * @return {String}
   */
  selfUrl (model) {
    const store = this.store;
    return `${this.baseUrl}/${store.type(model)}/${store.id(model)}`;
  }

  /**
   * Generate a related link.
   *
   * @param {*} model - a model
   * @return {String}
   */
  relatedUrl (model, relation) {
    const store = this.store;
    return `/${store.type(model)}/${store.id(model)}/${relation}`;
  }

  /**
   * Generate a relation url.
   *
   * @param {*} model - a model
   * @return {String}
   */
  relationUrl (model, relation) {
    const store = this.store;
    return `/${store.type(model)}/${store.id(model)}/links/${relation}`;
  }

  /**
   * Generate a links object entry, including linkage if any is available.
   *
   * @param {*} model - the model the links object is being created for
   * @param {String} relation - the relation to create a link object entry for
   * @param {*} included - a single model or a collection of models for linkage
   * @return {Object}
   */
  relate(model, relation, included) {
    const store = this.store;
    const self = this.relationUrl(model, relation);
    const related = this.relatedUrl(model, relation);
    if (!included) {
      return { self, related };
    }
    let linkage = null;
    if (store.isMany(included)) {
      linkage = included.reduce(function (result, model) {
        const id = store.id(model);
        if (id) {
          result.push({
            id: String(id),
            type: store.type(model)
          });
        }
        return result;
      }, []);
    } else {
      const id = store.id(included);
      if (id) {
        linkage = {
          id: store.id(included),
          type: store.type(included)
        };
      }
    }
    return { self, related, linkage };
  }

  /**
   * Generate a links object entry, including linkage if any is available.
   *
   * @param {*} model - the model the links object is being created for
   * @param {Array} includedRelations - an array of relation names to sideload
   * @param {*} linkedRelations - a array of relations to simply link
   * @return {Object}
   */
  link(model, includedRelations=[], linkedRelations=[]) {
    const store = this.store;
    const links = {
      self: this.selfUrl(model)
    };
    let included = [];
    // iterate relations that were sideloaded (included)
    includedRelations.forEach((relation) => {
      // get all sideloaded models for this relation
      const includes = store.related(model, relation);
      // build up a links object with linkage to the sideloaded models
      links[relation] =
        this.relate(model, relation, includes);
      // keep track of sideloaded (included) models
      if (store.isMany(includes)) {
        // if the included relation was a collection, push only the models
        // if the collection is empty, don't do anything.
        included = includes.length ?
          included.concat(store.modelsFromCollection(includes)) :
          included;
      } else {
        // otherwise, push the singularly related model (as long as it exists)
        if (store.id(includes)) {
          included.push(includes);
        }
      }
    });
    // iterate relations that were not sideloaded (included)
    linkedRelations.forEach((relation) => {
      // populate a links relation to tell client where to find related data
      links[relation] = this.relate(model, relation);
    });
    // return links object for this model and all sideloaded (included) data
    return { links, included };
  }

}

module.exports = JsonApiFormat;
