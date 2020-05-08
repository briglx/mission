(function(LMRX, $, undefined) {
    'use strict';

    var map;
    var predictions = [];

    console.log("Module Loaded")

    function selectedSuggestion(suggestionResult) {
        console.log("Adding selections")
        map.entities.clear();
        var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location);
        predictions.push(pushpin)
        map.entities.push(predictions)
        console.log(predictions.length)
    }

    jQuery(window).on('load', function() {
        
        console.log("window ready")
        var el

        el = jQuery("#myMap")[0]
        map = new Microsoft.Maps.Map(el, {
            center: new Microsoft.Maps.Location(0,0),
            zoom: 3,           
        });

        jQuery.get("/api/predictions", function(data ){
            // Add pin to map
            for (var i = 0; i < data.length; i++) {
                var loc = new Microsoft.Maps.Location(data[i].latitude, data[i].longitude)
                var pushpin = new Microsoft.Maps.Pushpin(loc);
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

        jQuery("#searchBox").click(function(el){
            jQuery("#searchBox").val('')
        })
    
    });
    
}(window.LMRX = window.LMRX || {}, jQuery));