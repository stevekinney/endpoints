const Kapow = require('kapow');
const expect = require('chai').expect;

const errorPayload = require('../../../lib/payloads/error_payload');

describe('errorPayload', function () {

  it('should accept a single error and return an object with code and data members', function() {
    var err = Kapow();
    var result = errorPayload(err);
    expect(result).to.have.property('code');
    expect(result).to.have.property('data');
    expect(result.data.errors).to.be.an('array');
  });

  it('should accept an array of errors and return an object with code and data members', function() {
    var errs = [Kapow(), Kapow(), Kapow()];
    var result = errorPayload(errs);
    expect(result).to.have.property('code');
    expect(result).to.have.property('data');
    expect(result.data.errors).to.be.an('array');
  });

  it('should set the returned code for a single error to that error\'s httpStatus', function() {
    expect(errorPayload(Kapow(404)).code).to.equal('404');
  });

  it('should default to status code 400', function() {
    expect(errorPayload().code).to.equal('400');
  });

  it('should default to the passed-in default status', function() {
    expect(errorPayload(null, 416).code).to.equal('416');
  });

  it('should set code to the httpStatus with the greatest number of errors', function() {
    var errs = [Kapow(404), Kapow(415), Kapow(416), Kapow(415), Kapow(404), Kapow(404)];
    expect(errorPayload(errs, 415).code).to.equal('404');
  });

  it('should set code for equal numbers of errors to the first status', function() {
    var errs = [Kapow(404), Kapow(415), Kapow(404), Kapow(415), Kapow(404), Kapow(415)];
    expect(errorPayload(errs, 415).code).to.equal('404');
  });

});
