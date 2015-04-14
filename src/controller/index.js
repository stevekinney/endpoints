const _ = require('lodash');
const validate = require('./lib/validate');
const handle = require('./lib/handle');

/**
  Provides methods for generating request handling functions that can
  be used by any node http server.
*/
class Controller {

  /**
    The constructor.

    @constructs Controller
    @param {Object} opts - opts.format: An endpoints format adapter.
    @param {Object} opts - opts.store: An endpoints store adapter.
    @param {Object} opts - opts.model: A model compatible with the store adapter.
    @param {Object} opts - opts.validators: An array of validating methods.
    @param {Object} opts - opts.allowClientGeneratedIds: boolean indicating this
  */
  constructor (opts={}) {
    if (!opts.format) {
      throw new Error('No format specified.');
    }
    if (!opts.store) {
      throw new Error('No store specified.');
    }
    if (!opts.model) {
      throw new Error('No model specified.');
    }
    this.config = _.extend({
      validators: [],
      allowClientGeneratedIds: false,
      allowToManyFullReplacement: true
    }, opts);
  }

  get capabilities() {
    // TODO: include this.config?
    return {
      filters: this.store.filters(this.model),
      includes: this.store.allRelations(this.model),
    };
  }

  /**
    Used for generating CRUD (create, read, update, destroy) methods.

    @param {String} method - The name of the function to be created.
    @returns {Function} - function (req, res) { } (node http compatible request handler)
  */
  static method (method) {
    return function (opts) {
      var config = _.extend({
        method: method,
        include: [],
        filter: {},
        fields: {},
        sort: [],
        schema: {},
      }, this.config, opts);
      var validationFailures = validate(method, config);
      if (validationFailures.length) {
        throw new Error(validationFailures.join('\n'));
      }
      return handle(config, this.store, this.model);
    };
  }

  static extend (props={}) {
    return class Controller extends this {
      constructor(opts={}) {
        super(_.extend({}, props, opts));
      }
    };
  }

}

/**
  Returns a request handling function customized to handle create requests.
*/
Controller.prototype.create = Controller.method('create');

/**
  Returns a request handling function customized to handle read requests.
*/
Controller.prototype.read = Controller.method('read');

/**
  Returns a request handling function customized to handle update requests.
*/
Controller.prototype.update = Controller.method('update');

/**
  Returns a request handling function customized to handle destroy requests.
*/
Controller.prototype.destroy = Controller.method('destroy');

module.exports = Controller;
