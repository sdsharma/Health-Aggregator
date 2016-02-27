var mfp = require('mfp');
var https = require('https');
var fs = require('fs');
var html = require('html');
var express = require('express');
var ejs = require('ejs');
var path = require("path");
var bodyParser = require('body-parser');
var passport = require('passport');
var JawboneStrategy = require('passport-oauth').OAuth2Strategy;
var jsonfile = require('jsonfile');
var request = require('request');
var cheerio = require('cheerio');
// var Converter = require("csvtojson").Converter;
// var converter = new Converter({});
var app = express();


 var jawboneAuth = {
  clientID: '_TRthWvktV4',
  clientSecret: '6bc750b8b39d83d6f16adcb637630be0e3df9a08',
  authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
  tokenURL: 'https://jawbone.com/auth/oauth2/token',
  callbackURL: 'https://localhost:3000/login/jawbone/callback'
};
var demoSession = {
    accessToken: '',
    refreshToken: ''
};
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.use(passport.initialize());
var sslOptions = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')
};


app.get('/login/jawbone', 
  passport.authorize('jawbone', {
    scope: ['move_read','calories'],
    failureRedirect: '/'
  })
);
app.get('/login/jawbone/callback', passport.authorize('jawbone', {
        scope: ['move_read','calories'],
        failureRedirect: '/'
    }), function(req, res) {
        res.redirect('/');
    }
);

//server
var usersFilePath = path.join(__dirname, '/views/macrosdata.json');
 app.get("/", function(req, res) {
    //get info from dates
    mfp.fetchDateRange('superdudeb', getDateTime(7), getDateTime(0), 'all', function(data){
      getMealsToday();
      jsonfile.writeFile(usersFilePath, data.data, function (err) {
          if(err){
            console.error(err);
          }
        });
      res.render('index.ejs', {caloriestoday: data.data[data.data.length - 1].calories});
    });
 });
 
 app.get(/^(.+)$/, function(req, res){ 
     res.sendfile( __dirname + "/views/" + req.params[0]); 
 });
passport.use('jawbone', new JawboneStrategy({
    clientID: jawboneAuth.clientID,
    clientSecret: jawboneAuth.clientSecret,
    authorizationURL: jawboneAuth.authorizationURL,
    tokenURL: jawboneAuth.tokenURL,
    callbackURL: jawboneAuth.callbackURL
}, function(accessToken, refreshToken, profile, done) {
    // we got the access token, store it in our temp session
    demoSession.accessToken = accessToken;
    demoSession.refreshToken = refreshToken;
    var user = {};
    done(null, user);
    console.dir(demoSession);
}));
  https.createServer(sslOptions, app).listen(3000, function(){
  console.log('Server listening on port ' + 3000);
});

//get current date
function getDateTime(offset) {
    var date = new Date();
    date.setDate(date.getDate() - offset);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day ;
}

function getMealsToday(){
  var url = "http://www.myfitnesspal.com/reports/printable_diary/superdudeb?from=" + getDateTime(0) + "&to=" + getDateTime(0);
  var usersMealPath = path.join(__dirname, '/views/mealsdata.json');
  request(url, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var i = 0;
    var parsedResults = [];
    $('td.first').each(function(i, element){
      // Get the rank by parsing the element two levels above the "a" element
      var food = $(this).text();

      var metadata = {
        food: food

      };
      // Push meta-data into parsedResults array
      parsedResults.push(metadata);

    });
    parsedResults.length = parsedResults.length - 5;
    parsedResults = parsedResults.slice(1,parsedResults.length-1);
    jsonfile.writeFile(usersMealPath, parsedResults, function (err) {
      if(err){
        console.error(err);
      }
    });
    // Log our finished parse results in the terminal
  }
});
  
}