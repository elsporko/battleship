var express    = require('express')
//  , jsonfile   = require('jsonfile')
  , fs         = require('fs')
  , http      = require('http')
  , bodyParser = require('body-parser');

var app = express();
app.use(express.static('static'));

var routes = require ('./routes/routes.js')(app);

app.set('port', process.env.PORT || 3000);
app.set('host', process.env.HOST || '0.0.0.0');

// all environments
app.set('view engine', 'pug');
//app.use(bodyParser.json());

http.createServer(app).listen(app.get('port'), app.get('host'), function(){
      console.log("Express server listening on port " + app.get('port'));
});
