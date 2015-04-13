require('babel/register');

describe('Unit', function () {
  require('../../src/application/test');
  require('../../src/controller/test');
  require('../../src/format-jsonapi/test');
  require('../../src/request-handler/test');
  require('../../src/response-formatter/test');
  require('../../src/store-bookshelf/test');
  require('../../src/validate-json-schema/test');
});
