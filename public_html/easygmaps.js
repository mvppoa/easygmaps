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
     * @example  $("#egwgmaps").();  
     * @Bugs In the moment the script will only work with 1 div. The id save for the address find must be refined.
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