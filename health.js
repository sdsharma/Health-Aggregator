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
    var jwdata = JSON.parse(fs.readFileSync('./views/jawbonedata.json', 'utf8'));
    mfp.fetchDateRange('superdudeb', getDateTime(7), getDateTime(0), 'all', function(data){
      getMealsToday();
      jsonfile.writeFile(usersFilePath, data.data, function (err) {
          if(err){
            console.error(err);
          }
        });
      var now = new Date();
      var start = new Date(now.getFullYear(), 0, 0);
      var diff = now - start;
      var oneDay = 1000 * 60 * 60 * 24;
      var days = Math.floor(diff / oneDay);
      var stepsPoints = (jwdata[days-8].m_steps * 50)/10000;
      var weightPoints = (Math.ceil(jwdata[days-9].weight * 2.2) - Math.ceil(jwdata[days-8].weight * 2.2)) * 50;
      if( weightPoints < 0 )
      {
          weightPoints = 0;
      }
      var caloriesBurnedPoints = jwdata[days-8].m_calories * 0.1;
      var inactivePoints = 0;
      if( (jwdata[days-8].m_inactive_time/3600).toFixed(2) < 8)
      {
          inactivePoints = 50;
      }
      var sleepPoints = 0;
      if( (jwdata[days-8].s_duration/3600).toFixed(2) > 7 && (jwdata[days-8].s_duration/3600).toFixed(2) < 11.1)
      {
          sleepPoints = 50;
      }
      var caloriesPoints = (data.data[data.data.length - 2].calories - data.data[data.data.length - 1].calories) * 0.25;
      if( caloriesPoints < 0 )
      {
          caloriesPoints = 0;
      }
      var activePoints =  (jwdata[days-8].m_active_time/3600).toFixed(2)*25;
      // console.log(jwdata[day-7]);
      res.render('index.ejs', {stepPoint: stepsPoints, weightPoint: weightPoints, caloriesBurnedPoint: caloriesBurnedPoints, 
          inactivePoint: inactivePoints, sleepPoint: sleepPoints, caloriesPoint: caloriesPoints, activePoint:activePoints, caloriestoday: data.data[data.data.length - 1].calories, stepstoday: jwdata[days-8].m_steps, 
          sleeptoday: (jwdata[days-8].s_duration/3600).toFixed(2), weighttoday: Math.ceil(jwdata[days-8].weight * 2.2), 
          caloriesburned: jwdata[days-8].m_calories, ahr: jwdata[days-8].avg_bg, iat: (jwdata[days-8].m_inactive_time/3600).toFixed(2), 
          aat: (jwdata[days-8].m_active_time/3600).toFixed(2)});
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
  var usersMealPath0 = path.join(__dirname, '/views/mealsdata0.json');
  var usersMealPath1 = path.join(__dirname, '/views/mealsdata1.json');
  var usersMealPath2 = path.join(__dirname, '/views/mealsdata2.json');
  var usersMealPath3 = path.join(__dirname, '/views/mealsdata3.json');
  request(url, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var i = 0;
    //var parsedResultsBreakfast = [];
    //var parsedResultsLunch = [];
    //var parsedResultsDinner = [];
    var whichMeal = -1;
    var parsedResultUpper = [[], [], [], [] ];
    $('td.first').each(function(i, element){
      // Get the rank by parsing the element two levels above the "a" element
      var food = $(this).text();

      if( food == "Breakfast")
      {
          whichMeal = 0;
      }
      if( food == "Lunch")
      {
          whichMeal = 1;
      }
      if( food == "Dinner")
      {
          whichMeal = 2;
      }
      if( food == "Snacks")
      {
          whichMeal = 3;
      }

      var metadata = {
        food: food

      };
      // Push meta-data into parsedResults array
      if(whichMeal != - 1 && food != "Breakfast" && food != "Lunch" && food != "Dinner" && food != "Snacks") {(parsedResultUpper[whichMeal]).push(metadata);}

    });
    (parsedResultUpper[whichMeal]).length = (parsedResultUpper[whichMeal]).length - 5;
    //parsedResults = parsedResults.slice(1,parsedResults.length-1);
    jsonfile.writeFile(usersMealPath0, parsedResultUpper[0], function (err) {
      if(err){
        console.error(err);
      }
    });
    jsonfile.writeFile(usersMealPath1, parsedResultUpper[1], function (err) {
      if(err){
        console.error(err);
      }
    });
    jsonfile.writeFile(usersMealPath2, parsedResultUpper[2], function (err) {
      if(err){
        console.error(err);
      }
    });
    jsonfile.writeFile(usersMealPath3, parsedResultUpper[3], function (err) {
      if(err){
        console.error(err);
      }
    });
    // Log our finished parse results in the terminal
  }
});
  
}