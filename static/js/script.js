'use strict';

var map;
var predictions = [];

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
            text: ""
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
    
}

$(window).on('load', function() {

    // Show saved predictions
    $.get("/api/predictions", function(data ){
        // Add pin to map
        for (var i = 0; i < data.length; i++) {
            var loc = new Microsoft.Maps.Location(data[i].latitude, data[i].longitude)
            var pushpin = new Microsoft.Maps.Pushpin(loc, {
                title: data[i].name,
                subTitle: data[i].location,
                text: ""
            });
            predictions.push(pushpin)
        }
        map.entities.push(predictions)

    });

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