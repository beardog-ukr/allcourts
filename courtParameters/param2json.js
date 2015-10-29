// This script takes list of courts and visual groups (yaml config) and creates
//json config files for both website and gathering utilities.

var program = require('commander');

var fs = require('fs');
var yamljs = require('yamljs');



//=============================================================================

program
  .version('0.0.1')
  .option('-c, --courts [filename]', 'File containing list of courts and visual groups')
  .option('-w, --website [dirname]', 'Folder to store website files')
  .option('-g, --gdata [dirname]', 'Folder for "gathering data" configuration')

  .parse(process.argv);




if (!program.courts) {
  console.log('Courts list file name incorrect');
  process.exit(1);
}


if (!program.website) {
  console.log('Website folder name incorrect');
  process.exit(1);
}

if (!program.gdata) {
  console.log('Data gathering folder name incorrect');
  process.exit(1);
}

// ============================================================================
// Functions ==================================================================
// ============================================================================



// ============================================================================
// Main =======================================================================
// ============================================================================

var conf = yamljs.load(program.courts);

var fullConfStr = JSON.stringify(conf, null, ' ');
var fcfn = program.gdata + '/visualGroups.json' ;
fs.writeFile(fcfn, fullConfStr, function (err) {
  if (err) {
    console.log('Failed to write ' + fcfn + ' : ' + err.toString() );
  }
//  console.log('Saved transformed data as '+fcfn);
});

