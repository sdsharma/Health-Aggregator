var mfp = require('mfp');
var http = require('http');
var fs = require('fs');
var html = require('html');
var express = require('express');
var ejs = require('ejs');
var path = require("path");
var jsonfile = require('jsonfile');
var app = express();
// app.use(express.static(__dirname + './'));
app.set('view engine', 'ejs');
//server
var usersFilePath = path.join(__dirname, '/views/macrosdata.json');
 app.get("/", function(req, res) {
    // res.sendfile('index.html');
    //get info from dates
    mfp.fetchDateRange('superdudeb', getDateTime(7), getDateTime(0), 'all', function(data){
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

app.listen(3000, function () {
  console.log('Server Started on Port 3000');
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
