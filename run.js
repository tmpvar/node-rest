var resource = require('./')();

resource('/hello')
  ('get', function(ctx) {
    ctx.respond(200, 'bla bla bla');
  })

  ('put', function(ctx) {
    ctx.respond(204, { 'Location' : '/hello/child' });
  });

  ('post', function(ctx) {
    ctx.respond(201, { 'Location' : '/hello/child' });
  });

resource('/')
  ('get', function(ctx) {
    ctx.respond('homepage!'); // defaults to 200 on GET
  });

resource.listen(9001);
