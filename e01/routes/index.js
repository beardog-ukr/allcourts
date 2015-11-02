var express = require('express');
var router = express.Router();

//  Well, here we have to deal with some problem. First, the default page for
// the domain should be rendered from 'index.jade' template
// Second, there is an url for each region (like 'http://allcourts.tk/kiev') and
// all this pages should be generated from the same template 'regionPage.jade'
// but with some changes

// the index page
router.get('/', function(req, res, next) {
  var glSettings = req.app.routingAppSettings ;
//  console.log("wsurl %s" , glSettings.websiteUrl);
  res.render('index', { glSettings, title: 'Розклад'});
});


// region pages
router.get('/dnipro', function(req, res, next) {
  var glSettings = req.app.routingAppSettings ;
  res.render('regionPage',
             { title: 'Розклад судів у ',
               regionStr: '',
               regionId:'dnipro',
               glSettings
             });
});

router.get('/kharkiv', function(req, res, next) {
  var glSettings = req.app.routingAppSettings ;
  res.render('regionPage',
             { title: 'Розклад судів у Харкові',
               regionStr: 'Харків',
               regionId:'kharkiv',
               glSettings
             });
});

router.get('/kiev', function(req, res, next) {
  var glSettings = req.app.routingAppSettings ;
  res.render('regionPage',
             { title: 'Розклад судів у Києві',
               regionStr: 'Київ',
               regionId:'kiev',
               glSettings
             });
});


router.get('/odesa', function(req, res, next) {
  var glSettings = req.app.routingAppSettings ;
  res.render('regionPage',
             { title: 'Розклад судів в Одесі ',
               regionStr: 'Одеса',
               regionId:'odesa',
               glSettings
             });
});

router.get('/poltava', function(req, res, next) {
  var glSettings = req.app.routingAppSettings ;
  res.render('regionPage',
             { title: 'Розклад судів у Полтаві',
               regionStr: 'Полтава',
               regionId:'poltava',
               glSettings
             });
});



module.exports = router;
