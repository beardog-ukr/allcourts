// ============================================================================
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
//  Processes incoming information on cases for one court;
// Supposes JSON is following:
//  {
//      judges : [ "one judge name", "another name" ]
//    , add_addresses : [ "one building address", "another .." ]
//    , cases : [
//      { date: "..."
//      , judge: <integer index in judges>
//      , forma: "..."
//      , number: "..."
//      , involved: "..."
//      , description: "..."
//      , add_address: <integer index in add_addresses> ]
//      } ,
//        { <another case data }
//        ....
//        ]
//  }
function processBigJSON( data, courtStr ) {
  console.log("processing "+ courtStr + " data");

  // court addresses
  for (var cai=0; cai<data.add_addresses.length; cai++) {
    courtAddresses.push ( {sh: (courtStr + "_" + cai ), addr:data.add_addresses[cai]} ) ;
  }

  // cases
  var cases = [];
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
    item += "<td>"+ courtStr + "_" + (val.add_address+1) + "</td>" ;
    item +="</tr>";

    cases.push(item);
  });

  if (cases.length) {
    $( cases.join( "" ) ).appendTo( "#courtsTbody" );
    console.log("Added " +courtStr+" cases");
  }


  processTaskDone(courtStr);
  console.log("Finished " +courtStr+" cases");
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

  console.log("Finished " +name+", " + tasks.length + " left");

  if (tasks.length==0) {
    var ca = "";
    for(var cai=0; cai<courtAddresses.length; cai++) {
      ca += "<li>" + courtAddresses[cai].sh + " — " + courtAddresses[cai].addr + "</li>" ;
//      console.log("Court: " + courtAddresses[cai] ) ;
    }

    $(ca).appendTo( "#courtsAddressList" );

    $( "#courtsDiv" ).show();
    $( "#requestDiv" ).hide();
    console.log("All tasks finished.");
  }
}

// ============================================================================

function processGenClick(){
//      $("#quote p").load("script.php");
//      console.log( "About to do something" );

  $("#generate").hide();
  $("#requestProgress").show();

  tasks = new Array();
  tasks.push("Gl");
//  tasks.push("Dr");
//  tasks.push("Ds");
//  tasks.push("Dn");
//  tasks.push("Ob");
//  tasks.push("Pc");
//  tasks.push("Pd");
//  tasks.push("Sv");
//  tasks.push("Sl");
  tasks.push("Sh");

  courtAddresses = new Array();

  $.getJSON( "recent/gl.json", function( data ) {
    var taskName="Gl";
    processBigJSON(data , taskName );
  });

  $.getJSON( "recent/sh.json", function( data ) {
    var taskName="Sh";
    processBigJSON(data , taskName );
  });

//  $.ajax({
//    type: "POST",
//    url: "http://" + "gl.ki.court.gov.ua" + "/new.php",
//    data: { q_court_id: "2601" }
//  })
//   .done(function( data ) {
//      processBigJSON(data , "Gl" );
//   })
//   .fail(function( jqXHR, textStatus ) {
//      alert( "Request failed: " + textStatus );
//      console.log(jqXHR);
//   });
}

// ============================================================================
// ============================================================================
// ============================================================================

$(document).ready(function(){
  $("#generate").click(processGenClick);

  $("#courtsDiv").hide();

  $("#requestProgress").hide();

  $.ajax({
    type: "GET",
    dataType:"html",
    url: "recent/date.txt"
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



