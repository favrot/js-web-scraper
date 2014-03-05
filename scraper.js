var fs = require('fs')
var http = require('http');
var cheerio = require('cheerio');
//var async = require('node-async');

// Utility function that downloads a URL and invokes
// callback with the data.
// From http://www.storminthecastle.com/2013/08/25/use-node-js-to-extract-data-from-the-web-for-fun-and-profit/
function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}

var currURL = "http://parahumans.wordpress.com/category/stories-arcs-1-10/arc-1-gestation/1-01/";
var prevURL = "";
var content = "";
var chapter = 0;

scrapeWorm(currURL);

function scrapeWorm(currURL) {
  download(currURL, function(data) {
    prevURL = currURL;
    if (data) {
      var $ = cheerio.load(data);
      // Scrape the title
      content += $(".entry-title").text() + "\n";
      // Scrape the story content for the whole page
      $(".entry-content > p").each(function(i, e) {
        content += $(e).text() + "\n\n";
      });
      // Write the pages contents to a file
      fs.appendFile('Worm.txt', content, function (err) {
      //if (err) throw err;
      });
      // update url to point to the next chapter
      currURL = $("a[title='Next Chapter']").attr('href');
      console.log("Got new URL: " + currURL);
      // Clear the content variable for the next chapter
      content = "";
      if(currURL) {
        (function(cURL) { 
          return scrapeWorm(cURL);
        }(currURL));
      }
    } else {
      console.log("error");
    }
  });
}