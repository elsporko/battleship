var express    = require('express')
//  , jsonfile   = require('jsonfile')
  , fs         = require('fs')
  , http      = require('http')
  , bodyParser = require('body-parser');

var app = express();

var routes = require ('./routes/routes.js')(app);

//const PORT = 3000;

// all environments
app.set('view engine', 'pug');
//app.set('port', PORT);
//app.set('port', process.env.PORT || PORT);
//app.use(bodyParser.json());

//http.createServer(app).listen(3000, '192.168.1.150');
app.listen(9999, '192.168.1.150');
