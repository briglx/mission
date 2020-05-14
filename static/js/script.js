'use strict';

var map, clusterLayer, infobox;
var predictions = [];
var color_blue = "#002654"
var color_red = "#CE1126"

function selectedSuggestion(suggestionResult) {
    console.log("Adding selections")

    // Get player name
    var player_name = $("#playerName").val()

    if (player_name == ""){
        player_name = "Unknown"
    }

    map.setView({
        center: suggestionResult.location,
        zoom: 5
    });

    map.entities.clear();
    var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location,
        {
            title: player_name,
            subTitle: suggestionResult.title,
            text: "", 
            color: color_blue
        });
    predictions.push(pushpin)
    map.entities.push(predictions)

    // Save to db
    var loc = {
        name: player_name, 
        location: suggestionResult.title,
        latitude: suggestionResult.location.latitude,
        longitude: suggestionResult.location.longitude,
        type: 'Guess'
    }

    $.ajax({
        url: "/api/predictions",
        type:"POST",
        data: JSON.stringify(loc),
        contentType:"application/json",
        dataType:"json",
        success: function(d){
            console.log( "Data Loaded: " + d );
        }
      })

    // jQuery.post( "/api/predictions", loc)
    //     .done(function( data ) {
    //         alert( "Data Loaded: " + data );
    //     });

    console.log(predictions.length)
}

function GetMap() {

    console.log("Callback worked")

    map = new Microsoft.Maps.Map('#myMap', {
        credentials: mapApiKey,
        center: new Microsoft.Maps.Location(0,0),
        zoom: 3,
    });
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), { visible: false });
    infobox.setMap(map);
    
}

function pushpinClicked(e) {
    //Show an infobox when a pushpin is clicked.
    showInfobox(e.target);
}

function showInfobox(pin) {
    var description = [];

    //Check to see if the pushpin is a cluster.
    if (pin.containedPushpins) {

        //Create a list of all pushpins that are in the cluster.
        description.push('<div>');
        for (var i = 0; i < pin.containedPushpins.length; i++) {
            description.push('<p>', pin.containedPushpins[i].getTitle(), '</p>');
        }
        description.push('</div>');
    }

    //Display an infobox for the pushpin.
    infobox.setOptions({
        title: pin.getTitle(),
        location: pin.getLocation(),
        description: description.join(''),
        visible: true
    });
}

function createCustomClusteredPin(cluster){

    var minRadius = 12;
	    var outlineWidth = 7;

    var clusterSize = cluster.containedPushpins.length;
    var radius = Math.log(clusterSize) / Math.log(10) * 5 + minRadius;
    var fillColor = 'rgba(0, 38, 84, 0.5)';

    var svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="', (radius * 2), '" height="', (radius * 2), '">',
            '<circle cx="', radius, '" cy="', radius, '" r="', radius, '" fill="', fillColor, '"/>',
            '<circle cx="', radius, '" cy="', radius, '" r="', radius - outlineWidth, '" fill="', fillColor, '"/>',
            '</svg>'];
    //Customize clustered pushpin.

    cluster.setOptions({
        icon: svg.join(''),
        anchor: new Microsoft.Maps.Point(radius, radius),
        description: "",
        textOffset: new Microsoft.Maps.Point(0, radius - 8) //Subtract 8 to compensate for height of text.
    });
    Microsoft.Maps.Events.addHandler(cluster, 'click', pushpinClicked);
    
}


function abortTimer() { 
    clearInterval(tid);
}

var count = 0

function updateMap(){
    console.log("Update map")

    // Show saved predictions
    $.get("/api/predictions", function(data ){
        // Add pin to map
        
        var color = color_blue

        // Clear out predictions
        predictions = [];
        for (var i = 0; i < data.length; i++) {
            var loc = new Microsoft.Maps.Location(data[i].latitude, data[i].longitude)
            
            if (data[i].type == "Actual"){
                color = color_red
            }
            else{
                color = color_blue
            }

            var pushpin = new Microsoft.Maps.Pushpin(loc, {
                title: data[i].name,
                subTitle: data[i].location,
                text: "",
                color: color
            });
            predictions.push(pushpin)
        }

        // clear layers
        map.layers.clear();

        Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function () {
            console.log("Clustering loaded ")

            // var pins = Microsoft.Maps.TestDataGenerator.getPushpins(1000, map.getBounds());

            clusterLayer = new Microsoft.Maps.ClusterLayer(predictions, {
                clusteredPinCallback: createCustomClusteredPin});
            map.layers.insert(clusterLayer);
        });

    });


}


function logCssElement() {

    var el = document.getElementById("searchBox");

    // var el = $("#searchBox")
    console.log(el)
    console.log("Computed Styles CSs Text...")
    console.log(window.getComputedStyle(el).cssText)
    console.log("Computed Styles...")
    console.log(window.getComputedStyle(el))
    
    // console.log(el.attr('style'))
    // console.log($("#searchBox").css())

    // for (var i=0;i<$("#searchBox").css().length;i++) {
    //     console.log(el.css()[i])
    // }

    if (count > 3){
        abortTimer()
    }

    count = count + 1
   
}


var tid;
$(window).on('load', function() {

    updateMap();
    // tid = setInterval(updateMap, 5000);
    // console.log("Timer ID: " + tid)

    
    // Add auto suggest to search
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
        var options = {
            maxResults: 4,
            map: map
        };
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#searchBox', '#searchBoxContainer', selectedSuggestion);
    });

});

$("#searchBox").click(function(el){
    $("#searchBox").val('')
})