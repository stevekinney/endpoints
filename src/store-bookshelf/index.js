// reading
exports.byId = require('./lib/by_id');
exports.allRelations = require('./lib/all_relations');
exports.id = require('./lib/id');
exports.isMany = require('./lib/is_many');
exports.modelsFromCollection = require('./lib/models_from_collection');
exports.related = require('./lib/related');
exports.toOneRelations = require('./lib/to_one_relations');
exports.type = require('./lib/type');
exports.read = require('./lib/read');
exports.serialize = require('./lib/serialize');

// writing
exports.create = require('./lib/create');
exports.update = require('./lib/update');
exports.destroy = require('./lib/destroy');
