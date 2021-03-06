const TYPE = 'application/vnd.api+json';

function applyHeaders (response, headers) {
  Object.keys(headers).forEach(function(header) {
    response.set(header, headers[header]);
  });
}

export function express (response, payload) {
  var code = payload.code;
  var data = payload.data;
  var headers = payload.headers;
  if (headers) {
    applyHeaders(response, payload.headers);
  }
  return response.set('content-type', TYPE).status(code).send(data);
}

export function hapi (response, payload) {
  var code = payload.code;
  var data = payload.data;
  var headers = payload.headers;
  if (headers) {
    applyHeaders(response, payload.headers);
  }
  return response(data).type(TYPE).code(code);
}
