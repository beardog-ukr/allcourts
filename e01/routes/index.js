var express = require('express');
var router = express.Router();

var fs = require('fs');

var vgStr = fs.readFileSync('./visualGroups.json', 'utf8');
var vg = JSON.parse(vgStr);

// the index page
router.get('/', function(req, res, next) {
  var ra = vg.groups ;
  var gls = req.app.routingAppSettings ;

  console.log("Index page rendering  here");
  
  console.log("wsurl is  %s" , gls.websiteUrl);
  res.render('index', 
             { "title": 'Розклад', 
		       "regionsArr":ra, 
		       "glSettings": gls
		     });
});

module.exports = router;
