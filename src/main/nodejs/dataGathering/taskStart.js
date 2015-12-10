//

var program = require('commander');

var fs = require('fs');
//var chpro = require('child_process');
var querystring = require('querystring');
var http = require('http');

//=============================================================================

program
  .version('0.0.1')
  .option('-c, --courts [filename]', 'File containing list of courts')
  .option('-a, --archive [dirname]', 'Folder for archived files')
  .option('-r, --recent [dirname]', 'Folder for recent files (actually used by website)')

  .parse(process.argv);

if (!program.courts) {
  console.log('Courts list file name incorrect');
  process.exit(1);
}

if (!program.archive) {
  console.log('Archive folder name incorrect');
  process.exit(1);
}

if (!program.recent) {
  console.log('Recent folder name incorrect');
  process.exit(1);
}

// ============================================================================
// Functions ==================================================================
// ============================================================================

// ============================================================================
//  Replaces "type of the case" with it's shortened variant if possible.
// If type of the case is unknown, returnt it as is.
// Input: type of case string; output - shortened variant
function makeTypeShort(caseStr) {

  var civCaseStr="Цивільні справи";
  var crimeCaseStr="Кримінальні справи";
  var admCaseStr="Адміністративні справи";
  var adm2CaseStr="Справи про адмінправопорушення";

  var trimmedCaseStr = caseStr.trim();
  var result = trimmedCaseStr ;

  switch (trimmedCaseStr) {
    case civCaseStr:
      result = "ЦС" ;
      break;
    case crimeCaseStr:
      result = "КС" ;
      break;
    case admCaseStr:
      result = "АС" ;
      break;
    case adm2CaseStr:
      result = "СпАП" ;
      break;
//    default:
      //
  }

  //console.log("makeTypeShort: Returning \'"+result+"\' for \'" + caseStr + "\'");
  return result;
}

// ============================================================================
// Transforms incoming raw JSON data to more compact form
function transformData(jsonData) {
  var rawObj ;

  var courtData = {};
  courtData.cases = [] ;
  courtData.judges = [] ;
  courtData.add_addresses = [] ;


  try {
    rawObj = JSON.parse(jsonData);
  }
  catch (e) {
    console.log(e);
    return courtData ;
  }

  console.log("got %d items", rawObj.length);

  var add_addresses = [];
  var judges = [];
  var cases = [];

  //
  rawObj.forEach(function(elem){
    var ne = {}; // new element of data

    // basic fields
    ne.date = elem.date;
    ne.forma = makeTypeShort(elem.forma);
    ne.number = elem.number ;
    ne.involved = elem.involved ;
    ne.description = elem.description ;

    // judge
    var eljudge = elem.judge ;
    if (!eljudge) {
      eljudge = '';
    }
    var jidx = judges.indexOf(eljudge);
    if (jidx<0) {
      jidx = judges.push(eljudge) -1 ;
    }
    ne.judge = jidx;

    // add address
    var elaa = elem.add_address ;
    if (!elaa) {
      elaa = '' ;
    }
    var aaidx = add_addresses.indexOf(elaa);
    if (aaidx<0) {
      aaidx = add_addresses.push(elaa) -1 ;
    }
    ne.add_address = aaidx ;

    // finally add new element to cases
    cases.push(ne);
  });

  //
  courtData.cases = cases ;
  courtData.judges = judges ;
  courtData.add_addresses = add_addresses ;

  //
  //console.log(JSON.stringify(courtData));
  //console.log( prettyjson.render(courtData, {noColor: true}) );
  return courtData ;
}

// ============================================================================
// Performs all actions needed to process one court
function old_processOneCourt(court) {
  console.log("taskStart: processing " + court.fileid);

  // download info (with wget)
  var expectedJsonFilename = program.recent + '/newp.json';
  console.log( "%s",
               chpro.execFileSync('./wgetOneCourt.sh',
                                  [court.fileid, court.code, expectedJsonFilename])
             );

  // transform newly loaded data into a form used by website
  var rawDataStr = "";
  rawDataStr = fs.readFileSync(expectedJsonFilename, 'utf8');

  var pd = transformData(rawDataStr);
  var pdstr = JSON.stringify(pd, null, ' ');

  var recentFileName= program.recent + '/' + court.fileid + '.json';
  fs.writeFile(recentFileName, pdstr, function (err) {
    if (err) throw err;
    console.log('Saved transformed data as '+recentFileName);
  });

  // move the newly downloaded file to archive folder
  var tsd = new Date();
  var tss = 'd' + tsd.getFullYear() + tsd.getMonth() + tsd.getDay() +
            '_' + tsd.getHours() + tsd.getMinutes() + tsd.getSeconds();
  var afn = program.archive + '/' + tss + '.' + court.fileid + '.json';
  fs.renameSync(expectedJsonFilename, afn);

}

// ============================================================================
// Performs all actions needed to process one court
//Actually we'll onlu send a post request for data here; all other actions will
//be done in callbacks
function processOneCourt(court) {
  console.log("taskStart: processing " + court.fileid);

  var turl = 'http://' + court.fileid + '.court.gov.ua/new.php' ;

  // Build the post string from an object
  var postData = querystring.stringify({
    'q_court_id' : court.code
  });

  // An object of options to indicate where to post to
  var postOptions = {
    host: court.fileid + '.court.gov.ua',
    port: '80',
    path: '/new.php',
    method: 'POST',
    headers: {
//          'Content-Type': 'application/x-www-form-urlencoded',
//          'Content-Length': Buffer.byteLength(post_data)
      'Accept': 'application/json, text/javascript, */*; q=0.01' ,
      'Accept-Encoding': 'gzip, deflate' ,
      'Accept-Language': 'en-US,en;q=0.5' ,
      'Cache-Control': 'no-cache' ,
      'Connection': 'keep-alive' ,
      'Content-Length':  postData.length, // was '15' in the browser
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' ,
      'Pragma': 'no-cache' ,
      'Referer': court.scheduleurl,
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:28.0) Gecko/20100101 Firefox/28.0' ,
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  // Set up the request
  var req = http.request(postOptions, function(res) {
    var respCourtId = court.fileid ;
    var respWholeStr = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
//      console.log('Response %s chunk received', respCourtId);
      respWholeStr += chunk ;
    });

    res.on('end', function() {
//      console.log('No more data in response for ' + respCourtId)

      var pd = transformData(respWholeStr);
      var pdstr = JSON.stringify(pd, null, ' ');

      var recentFileName= program.recent + '/' + respCourtId + '.json';
      fs.writeFile(recentFileName, pdstr, function (err) {
        if (err) {
          console.log( 'Failed to write data for %s : %s ', respCourtId, err.toString()) ;
          return ;
        };
        console.log('Saved transformed data as '+recentFileName);
      });

      // also save a copy of data to archive folder
      var tsd = new Date();
      var tss = 'd' + tsd.getFullYear() + tsd.getMonth() + tsd.getDay() +
                '_' + tsd.getHours() + tsd.getMinutes() + tsd.getSeconds();
      var afn = program.archive + '/' + tss + '.' + court.fileid + '.json';
      fs.writeFile(afn, pdstr, function (err) {
        if (err) {
          console.log( 'Failed to write data to archive for %s : %s ', respCourtId, err.toString()) ;
          return ;
        };
        console.log('Saved transformed data to archive as '+recentFileName);
      });

    })
  });

  req.on('error', function(err) {
    var respCourtId = court.fileid ;
    console.log('problem with request for %s:' , respCourtId);
    console.log( err.message);
  });

  // write data to request body
  req.write(postData);
  req.end();

}

// ============================================================================
// Main =======================================================================
// ============================================================================

var courtsFileName = program.courts ;

console.log('taskStart: will process %s', courtsFileName)

var courtsStr = "";
courtsStr = fs.readFileSync(courtsFileName, 'utf8');

var courtsData = JSON.parse(courtsStr);

var courts = courtsData.courts;

console.log ("taskStart: has to process %d courts", courts.length);

for (var ci=0; ci<courts.length; ci++) {
  // Some timeout to reduce load of the courts website
  setTimeout(processOneCourt, 9*1000*(ci+1), courts[ci]);  
}

//processOneCourt(courts[0]); // this line is for debug purposes only
//processOneCourt(courts[1]);
//console.log ("taskStart: done");



