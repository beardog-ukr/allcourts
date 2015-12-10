
// ============================================================================

var courtAddresses;

function makeCourtAddressShort(str) {
  var ti = courtAddresses.indexOf(str);
  if (ti<0) {
//    console.log("Add new Address " + str);
    return courtAddresses.push(str);
  }

  //else
  return (ti+1); //since we'll count addresses  from 1
}

// ============================================================================

function processBigJSON( data, courtStr ) {
//  console.log("processing "+ courtStr + " data");

  var cases = [];

  var baseCourtAddress = courtAddresses.length;
  courtAddresses = courtAddresses.concat(data.add_addresses);

  $.each( data.cases, function( key, val ) {
    var item = "";
    item += "<tr>" ;
    item += "<td>"+ val.date + "</td>" ;
    item += "<td>"+ data.judges[val.judge] + "</td>" ;
    item += "<td>"+ val.number + "</td>" ;
    item += "<td>"+ val.involved + "</td>" ;
    item += "<td>"+ val.description + "</td>" ;
    item += "<td>"+ val.forma + "</td>" ;
    item += "<td>"+ courtStr + "</td>" ;
    item += "<td>"+ (baseCourtAddress+val.add_address+1).toString() + "</td>" ;
    item +="</tr>";

    cases.push(item);
  });

  if (cases.length) {
    $( cases.join( "" ) ).appendTo( "#courtsTbody" );
//    console.log("Added " +courtStr+" cases");
  }

  processTaskDone(courtStr);
//  console.log("Finished " +courtStr+" cases");
};

// ============================================================================

var tasks ;

function processTaskDone(name) {

  var tidx = tasks.indexOf(name) ;
  if (tidx<0) {
    console.log ("unknown task " + name);
    return ;
  }

  tasks.splice(tidx,1); //removes element from array

//  console.log("Finished " +name+", " + tasks.length + " left");

  if (tasks.length==0) {
    var ca = "";
    for(var cai=0; cai<courtAddresses.length; cai++) {
      ca += "<li>" + courtAddresses[cai] + "</li>" ;
//      console.log("Court: " + courtAddresses[cai] ) ;
    }

    $(ca).appendTo( "#courtsAddressList" );

    $( "#courtsDiv" ).show();
    $( "#requestDiv" ).hide();
//    console.log("All tasks finished.");
  }
}

// ============================================================================

function processVisualGroups(data) {
//  console.log("processing visual groups json for %s", regionStr);

  //create tasks (one per each court)
  tasks = new Array();
  data.courts.forEach(function( val ) {
    if (val.group==regionStr) {
      tasks.push(val.fileid);
    } // of if
  });

  // actually start the tasks (make ajax requests)
  data.courts.forEach(function( val ) {

    if (val.group==regionStr) {
      var fn = staticUrl+"/recent/" + val.fileid + ".json" ;
      $.getJSON( fn, function( data ) {
        var taskName=val.fileid;
        processBigJSON(data , taskName );
      });
    } // of if

  });

  // and fill the paragraph with court names
  var cnstr = '' ;
  data.courts.forEach(function( val ) {
    if (val.group==regionStr) {
      cnstr += '<li>' + val.fileid + ' — ' + val.namestr + '</li>';
    } // of if
  });
  $(cnstr).appendTo( "#courtsNamesUl" );

}

// ============================================================================

function processGenClick(){

  $("#generate").hide();
  $("#requestProgress").show();

  courtAddresses = new Array();

  // This is two-stage process
  // First, we'll get a list of courts (groups), and then will request data for
  //all courts of current  region
  $.getJSON( staticUrl+"/recent/visualGroups.json", function( data ) {
    processVisualGroups(data);
  });
}

// ============================================================================
// ============================================================================
// ============================================================================

$(document).ready(function(){
  $("#generate").click(processGenClick);

  $("#courtsDiv").hide();

  $("#requestProgress").hide();

  // get info about last data update
  $.ajax({
    type: "GET",
    dataType:"html",
    url: staticUrl+"/recent/date.txt"
  })
   .done(function( data ) {
      var str = "Дані в останній раз оновлено: " + data ;
      $("#lastUpdateP").append( str );
//      console.log(data);
   })
   .fail(function( jqXHR, textStatus ) {
      alert( "Не вдалось отримати інформацію про час останнього оновлення даних");
      $("Не вдалось отримати інформацію про час останнього оновлення даних").appendTo( "#lastUpdateP" );
      console.log(jqXHR);
   });

});



