var http = require('http');
var codes = require('./codes');

module.exports = function() {
  var rest = function(route) {
    return rest.handlers(rest.router.add(route));
  };

  rest.handlers = function(route){
    route.methods = route.methods || {};

    route.methods.options = route.methods.options || function(ctx) {
      var methods = Object.keys(route.methods).filter(function(key) {
        return key !== 'options';
      });

      ctx.respond(200, methods);
    };

    route.method = function(verb, accept, fn) {

      if (verb && accept && !fn) {
        fn = accept;
        accept = null
      }

      route.methods[verb.toLowerCase()] = function(ctx) {
        // TODO: accept header stuff
        fn(ctx);
      }
      return route.method;
    };
    return route.method;
  };

  rest.router = (function() {
    var routes = {};

    return {
      add : function(str) {
        var segments = str.split('/'), segment, location = routes;
        for (var i=0; i<segments.length; i++) {
          segment = segments[i];
          if (typeof location[segment] === 'undefined') {
            location[segment] = rest.handlers({});
          }
          location = location[segment];
        }
        return location;
      },
      handle : function(req, res) {
        // Handle options
        var method = req.method.toLowerCase();
        var ctx = {
          respond : function(code, headers, data) {
            if (code && headers && !data) {
              data = headers;
              headers = {};
            } else if (code && !headers && !data) {
              data = code;
              code = 200;
              headers = {};
            }

            if (typeof data === 'object') {
              data = JSON.stringify(data);
              headers['Content-type'] = headers['Content-type'] || 'application/json';
            }

            if (!headers['Content-length'] && typeof data === 'string') {
              headers['Content-length'] = data.length;
            }

            // TODO: streams, json, html (look for <)
            res.writeHead(code, headers);
            res.end(data);
          }
        };

        var segments = req.url.split('/'), segment, location = routes;
        for (var i=0; i<segments.length; i++) {
          segment = segments[i];

          if (!location[segment]) {
            return ctx.respond(404, {'Content-type' : 'text/plain'}, 'Not Found');
          }
          location = location[segment];
        }

        if (!location.methods[method]) {
          return ctx.respond(501, {'Content-type' : 'text/plain'}, 'Not Implemented');
        }

        location.methods[method](ctx);

      },
      debug : function() {
        console.log(routes);
      }
    }
  })()

  rest.listen = function(host, port, cb) {
    http.createServer(rest.router.handle).listen(host, port, cb);
  };

  return rest;
};