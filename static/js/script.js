(function(LMRX, $, undefined) {
    'use strict';

    var map;
    var predictions = [];
    // function loadMapScenario() 

    console.log("Module Loaded")

    function selectedSuggestion(suggestionResult) {
        console.log("Adding selections")
        map.entities.clear();
        // map.entities.clear();
        // map.setView({ bounds: suggestionResult.bestView });
        var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location);
        predictions.push(pushpin)
        // map.entities.push(pushpin);
        map.entities.push(predictions)
        // document.getElementById('printoutPanel').innerHTML =
        //     'Suggestion: ' + suggestionResult.formattedSuggestion +
        //         '<br> Lat: ' + suggestionResult.location.latitude +
        //         '<br> Lon: ' + suggestionResult.location.longitude;
        
        // map.entities.push(pushpin)

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