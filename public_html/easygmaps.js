/*
 Easy GMaps Plugin for jQuery
 Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
 Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
 and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 
 Version: 0.5.10
 */
(function($) {
    /*
     * Allows only valid characters to be entered into input boxes.
     *
     * @name     easygmaps
     * @param    config      { decimal : "." , negative : true }
     * @author   Marcelo Fachinelli (http://www.codigosecafe.wordpress.com)
     * @example  $("#easygmaps").easygmaps();  
     * @example  $("#easygmaps").easygmaps({marker:{latitude:1,longitude:-1}});  
     * @example  $("#easygmaps").easygmaps({marker:"Julio de Castilhos 432 Centro Porto Alegre RS Brasil"});  
     * @example  $("#easygmaps").easygmaps({marker:[{latitude:1,longitude:-2},{latitude:1,longitude:-1},{latitude:1,longitude:0}]});  
     * @example  $("#easygmaps").easygmaps({marker:["Julio de Castilhos 432 Centro Porto Alegre RS Brasil","Av. Ipiranga 6681 Floresta Porto Alegre RS Brasil"]});  
     * @example  $("#easygmaps").easygmaps({marker:{latitude:1,longitude:-1},icon:"iconpath.png"});  
     * @example  $("#easygmaps").easygmaps({marker:"Julio de Castilhos 432 Centro Porto Alegre RS Brasil",icon:"iconpath.png"});  
     * @example  $("#easygmaps").easygmaps({marker:[{latitude:1,longitude:-2},{latitude:1,longitude:-1},{latitude:1,longitude:0}],icon:"iconpath.png"});  
     * @example  $("#easygmaps").easygmaps({marker:["Julio de Castilhos 432 Centro Porto Alegre RS Brasil","Av. Ipiranga 6681 Floresta Porto Alegre RS Brasil"],icon:"iconpath.png"});  
     * @Bugs In the moment the script will only work with 1 div. The id save for the address find must be refined.
     * @Bugs A little more work must be made to work it the addresses. They are being called in the ajax function inside the addMarker function and then it calls
     *       addMarker again. It should be optimized.
     *       Also the icon must be optimized since it cannot discriminate which resource is equivalent to a value displayed in the application.
     */
    
    var easygmapsid = null;
    
    $.fn.easygmaps = function(config) {
        this.initializeMap = $.fn.easygmaps.initializeMap;
        this.addMarker = $.fn.easygmaps.addMarker;
        if (typeof this.data("easygmapsinitialized") === "undefined") {
            this.data("easygmapsinitialized", true);
            this.data("easygmapsicon", config.icon);
            easygmapsid = $(this).attr("id");
            this.initializeMap();
            this.addMarker(config.marker);
        }
        return this;
    };

    $.fn.easygmaps.initializeMap = function(e) {
        //The latitude and longitude must be initialized to display the map.
        //The markers will be used to place map pins.
        //The pins will can be customized.

        if (typeof $(this).attr("id") === "undefined") {
            console.warn("No id was setted");
        }

        var map = new GMaps({
            div: '#' + $(this).attr("id"),
            zoom: 5
        });
        
        this.data("map", map);
        return true;
    };


    /**
     * Funciton to add a position to the map. It will get the position with the latitude and longitude or the address and it will add them in the current map,
     * calculating the distance between them and showing both in the map, regardless of its original zoom.
     * @example  $("#easygmaps").easygmaps().addMarker({latitude:1,longitude:-1});  
     * @example  $("#easygmaps").easygmaps().addMarker("Julio de Castilhos 432 Centro Porto Alegre RS Brasil");  
     * @example  $("#easygmaps").easygmaps().addMarker([{latitude:1,longitude:-2},{latitude:1,longitude:-1},{latitude:1,longitude:0}]);  
     * @example  $("#easygmaps").easygmaps().addMarker(["Julio de Castilhos 432 Centro Porto Alegre RS Brasil","Av. Ipiranga 6681 Floresta Porto Alegre RS Brasil"]);  
     * @param {Object} markers Variables to be inserted. They may be coordinates or the address, in an array or not. See the exampes above
     * @returns {Boolean} True for map insertion and false for failure.
     */
    $.fn.easygmaps.addMarker = function(markers) {

        var currentMap = this.data("map");
        var currentIcon = this.data("easygmapsicon");
        
        function addMarkerOnMap(lat, lng) {
            var marker = {
                lat: lat,
                lng: lng
            };
            if(typeof currentIcon !== "undefined"){
                marker["icon"] = currentIcon;
            }
            currentMap.addMarker(marker);
        }

        function codeAddress(address) {
            var geocoder = geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': address}, 
                function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var latres = results[0].geometry.location.lat();
                    var lngres = results[0].geometry.location.lng();
                    $("#"+easygmapsid).easygmaps().addMarker({latitude:latres,longitude:lngres});
                } else {
                    console.warn("Geocode was not successful for the following reason: " + status);
                }
            });
        }

        if (typeof markers === "undefined") {
            console.warn("The marker variable must be filled.");
            return false;
        }

        try {
            if (typeof markers === "string") {
                codeAddress(markers);
            } else if (markers.length > 1) {
                for (var markerIterator = 0; markerIterator < markers.length; markerIterator++) {
                    if (typeof markers[markerIterator].latitude !== "undefined") {
                        addMarkerOnMap(markers[markerIterator].latitude, markers[markerIterator].longitude);
                    } else {
                        codeAddress(markers[markerIterator]);
                    }
                }
            } else if (typeof markers.latitude !== "undefined") {
                addMarkerOnMap(markers.latitude, markers.longitude);
            }
        }
        catch (exception) {
            console.error("An error ocurred inserting the values on the map -> " + exception);
            return false;
        }

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < currentMap.markers.length; i++) {
            bounds.extend(currentMap.markers[i].position);
        }
        currentMap.fitBounds(bounds);

        return true;
    };

})(jQuery);