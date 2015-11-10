var express = require('express');
var router = express.Router();

var fs = require('fs');

var vgStr = fs.readFileSync('./visualGroups.json', 'utf8');
var vg = JSON.parse(vgStr);

router.get('/:regionStr', function(req, res, next) {
  
  var fidx = -1 ;
  for (var i=0; i<vg.groups.length; i++) {
    if (vg.groups[i].id == req.params.regionStr) {
      fidx = i ;
      break;
    }
  }
  
  if (fidx>=0) {
    console.log('responding for ' + req.params.regionStr);
    var gls = req.app.routingAppSettings ;
    res.render('regionPage',
               { title: 'Розклад судів' ,
                 regionStr: vg.groups[fidx].str ,
                 regionId: req.params.regionStr ,
                 "regionsArr": vg.groups,
                 glSettings : gls
             });
  }
  else {
    next();
  }
});

module.exports = router;
