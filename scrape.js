var request = require('request');
var cheerio = require('cheerio');

request('http://www.myfitnesspal.com/reports/printable_diary/superdudeb?from=2016-02-26&to=2016-02-26', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var parsedResults = [];
    var i = 0;

    $('td.first').each(function(i, element){
      // Get the rank by parsing the element two levels above the "a" element
      var food = $(this).text();

      console.log(food);


      var metadata = {
        food: food

      };
      // Push meta-data into parsedResults array
      parsedResults.push({"food" :metadata});
    });
    // Log our finished parse results in the terminal
    console.log(parsedResults[0]);
  }
});