var resource = require('./')();

resource('/hello')
  ('get', function(r) {
    r(200, 'bla bla bla');
  })

  ('put', function(r) {
    r(204, { 'Location' : '/hello/child' });
  });

  ('post', function(r) {
    r(201, { 'Location' : '/hello/child' });
  });

resource('/')
  ('get', function(r) {
    r('homepage!'); // defaults to 200 on GET
  });

resource.listen(9001);
