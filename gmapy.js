(function($) {
    var directionsDisplay;
    var directionsService;
    var chart;
    var travelingMod;
    var indexOfLeg =0;
    var elevations = null;
    var openedInfoWindow = null;
    var geocoder = new google.maps.Geocoder();
    function MyOverlay(map) {
        this.setMap(map);
    };
    MyOverlay.prototype = new google.maps.OverlayView();
    MyOverlay.prototype.onAdd = function() {
    };
    MyOverlay.prototype.onRemove = function() {
    };
    MyOverlay.prototype.draw = function() {
    };
    
    /**
        * Vytvori novou instanci
        * @class Gmapy  
    */
    $.Gmapy = {};
    $.fn.Gmapy = function(options) {
        return this.each(function() {
            var Gmapy = $(this).data('Gmapy');
            if (!Gmapy) {
                var GmapyBase = $.extend(true, {}, $.GmapyBase);
                $(this).data('Gmapy', GmapyBase.init(this, options));
                $.Gmapy = GmapyBase;
            }
            else {
                $.Gmapy = Gmapy;
            }
        });
    };
    
        
    $.GmapyBase = {
        defaults: {
            address: '',
            latitude: 49.817491999999990000,
            longitude: 15.472962000000052000,
            zoom: 7,
            delay: 200,
            hideByClick: false,
            oneInfoWindow: false,
            prefixId: 'gmarker',
            polyId: 'gpoly',
            groupId: 'ggroup',
            navigationControl: true,
            navigationControlOptions: {
                position: 'TOP_LEFT',
                style: 'DEFAULT'
            },
            mapTypeControl: true,
            mapTypeControlOptions: {
                position: 'TOP_RIGHT',
                style: 'DEFAULT'
            },
            scaleControl: false,
            scrollwheel: true,
            directions: false,
            directionsResult: null,
            disableDoubleClickZoom: false,
            streetViewControl: false,
            markers: [],
            overlays: [],
            polyline: {
                color: '#FF0000',
                opacity: 1.0,
                weight: 2
            },
            polygon: {
                color: '#FF0000',
                opacity: 1.0,
                weight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.2
            },
            circle: {
                color: '#FF0000',
                opacity: 1.0,
                weight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.2
            },
            rectangle: {
                color: '#FF0000',
                opacity: 1.0,
                weight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.2
            },
            maptype: 'HYBRID', 
            html_prepend: '<div class=gmapyMarker>',
            html_append: '</div>',
            addMarker: false
        },
        map: null,
        count: 0,
        directionsArray: [],
        infoWindowsArray: [],
        markers: [],
        polylines: [],
        polygons: [],
        circles: [],
        rectangles: [],
        tmpMarkers: [],
        geoMarkers: [],
        lockGeocode: false,
        bounds: null,
        overlays: null,
        overlay: null,
        mapId: null,
        plId: null,
        pgId: null,
        cId: null,
        rId: null,
        opts: null,
        centerLatLng: null,
    
        init: function(el, options) {
            var opts = $.extend(true, {}, $.GmapyBase.defaults, options);
            this.mapId = $(el);
            this.opts = opts;
            if (opts.address)
                this.geocode({address: opts.address, center: true});
            else if ($.isArray(opts.markers) && opts.markers.length > 0) {
                if (opts.markers[0].address)
                    this.geocode({address: opts.markers[0].address, center: true});
                else
                    this.centerLatLng = new google.maps.LatLng(opts.markers[0].latitude, opts.markers[0].longitude);
            }
            else
                this.centerLatLng = new google.maps.LatLng(opts.latitude, opts.longitude);
            var myOptions = {
                center: this.centerLatLng,
                disableDoubleClickZoom: opts.disableDoubleClickZoom,
                mapTypeControl: opts.mapTypeControl,
                streetViewControl: opts.streetViewControl,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition[opts.mapTypeControlOptions.position.toUpperCase()],
                    style: google.maps.MapTypeControlStyle[opts.mapTypeControlOptions.style.toUpperCase()]
                },
                mapTypeId: google.maps.MapTypeId[opts.maptype.toUpperCase()],
                navigationControl: opts.navigationControl,
                navigationControlOptions: {
                    position: google.maps.ControlPosition[opts.navigationControlOptions.position.toUpperCase()],
                    style: google.maps.NavigationControlStyle[opts.navigationControlOptions.style.toUpperCase()]
                },
                scaleControl: opts.scaleControl,
                scrollwheel: opts.scrollwheel,
                zoom: opts.zoom
            };
            this.map = new google.maps.Map(el, myOptions);
            this.overlay = new MyOverlay(this.map);
            this.overlays = {
                polyline: {id: 'plId', array: 'polylines', create: 'createPolyline'},
                polygon: {id: 'pgId', array: 'polygons', create: 'createPolygon'},
                circle: {id: 'cId', array: 'circles', create: 'createCircle'},
                rectangle: {id: 'rId', array: 'rectangles', create: 'createRectangle'}
            };
            this.plId = $('<div style="display:none;"/>').appendTo(this.mapId);
            this.pgId = $('<div style="display:none;"/>').appendTo(this.mapId);
            this.cId = $('<div style="display:none;"/>').appendTo(this.mapId);
            this.rId = $('<div style="display:none;"/>').appendTo(this.mapId);
            for (var j = 0, l = opts.markers.length; j < l; j++)
                this.createMarker(opts.markers[j]);
            for (var j = 0, l = opts.overlays.length; j < l; j++)
                this[this.overlays[opts.overlays[j].type].create](opts.overlays[j]);
            var Gmapy = this;
            if (opts.addMarker == true || opts.addMarker == 'multi') {
                google.maps.event.addListener(Gmapy.map, 'click', function(event) {
                    var options = {
                        position: event.latLng,
                        draggable: true
                    };
                    var marker = Gmapy.createMarker(options);
                    google.maps.event.addListener(marker, 'dblclick', function(event) {
                        marker.setMap(null);
                        Gmapy.removeMarker(marker.id);
                    });
                });
            }
            else if (opts.addMarker == 'single') {
                google.maps.event.addListener(Gmapy.map, 'click', function(event) {
                    if (!Gmapy.singleMarker) {
                        var options = {
                            position: event.latLng,
                            draggable: true
                        };
                        var marker = Gmapy.createMarker(options);
                        Gmapy.singleMarker = true;
                        google.maps.event.addListener(marker, 'dblclick', function(event) {
                            marker.setMap(null);
                            Gmapy.removeMarker(marker.id);
                            Gmapy.singleMarker = false;
                        });
                    }
                });
            }
            delete opts.markers;
            delete opts.overlays;
            return this;
        },
        ready: function(f) {
            google.maps.event.addListenerOnce(this.map, 'bounds_changed', function() {
                return f();
            });
        },
        
        
        /**
         * Funkce, ktera vrati longitude a latitude souradnice oddelene carkou
         * @method getCoordinates
         * @param point {object} bod na mape
         * @return LnglatStr6 {String} vraci longitude a latitude souradnice oddelene carkou
        */
        getCoordinatesLngLat: function(point){
            var LnglatStr6 = point.latLng.lng().toFixed(6) + ', ' + point.latLng.lat().toFixed(6);
            return LnglatStr6;
        },
        getCoordinatesLatLng: function(point){
            var LnglatStr6 = point.latLng.lat().toFixed(6) + ', ' + point.latLng.lng().toFixed(6);
            return LnglatStr6;
        },
        /*
         * Funkce vrati souradnice v opacnem poradi longitude, latitude
         * @param {type} indexOfMarker
         * @return {unresolved}
         */
        getMarkerCoordinatesLngLat: function(indexOfMarker){
            var markerInArray = $(this.mapId).data(this.markers[indexOfMarker]);
            var markercoordLat = markerInArray.getPosition().lat();
            var markercoordLng = markerInArray.getPosition().lng();
            var markercoord = markercoordLng + ', ' + markercoordLat;
            return markercoord;
        },
        getMarkerCoordinatesLatLng: function(indexOfMarker){
            var markerInArray = $(this.mapId).data(this.markers[indexOfMarker]);
            var markercoord = markerInArray.position.toUrlValue();
            return markercoord;
        },
        
        /**
         * Funkce, která ze zvolené adresy URL zobrazí kml na mapě
         * @method getKML
         * @param kmladress {url} URL adresa kml souboru
        */
        getKML: function(kmladress) {
            var kmlLayer = new google.maps.KmlLayer({
                url: kmladress, 
                map: this.map
            });

        },
        parseKML: function(kmlfile) {
            var geoXml = new geoXML3.parser({map: this.map, singleInfoWindow: true});
            geoXml.parse(kmlfile); 
            this.markers.push(geoXml.docs[0].placemarks[0].marker);
            
//            function getCoordKml(placemark){
//                //var coord = new google.maps.LatLng(placemark.Point.coordinates[0].lat, placemark.Point.coordinates[0].lng);
////                var coordLat = placemark.Point.coordinates[0].lat;
////                var coordLng = placemark.Point.coordinates[0].lng;
//                var coordLat = placemark.name;
//                
//                var cor = document.getElementById("saveBox");
//                cor.innerHTML= coordLat;
//            }
        },
        
        /**
         * Funkce, která vrací adresu z latitude a longitude souřadnic
         * @method getAddress
         * @param latLng {latLng} pocatecni bod
         * @param summaryPanel {div} misto, kde bude adresa zobrazena
        */
        getAddress: function(latLng,summaryPanel){
            geocoder.geocode( {'latLng': latLng},
            function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) {
                    if(results[0]) {
                        summaryPanel.innerHTML = results[0].formatted_address;
                    }
                    else {
                        summaryPanel.innerHTML = "No results";
                    }
                }
                else {
                    summaryPanel.innerHTML = status;
                }
            });
        },        
        
        /**
         * Funkce, která vrací vzdálenost mezi dvěma body v metrech
         * @method getDistance
         * @param p1 {latLng} počáteční bod
         * @param p2 {latLng} koncový bod
        */
        getDistance: function(p1, p2) {
          
          function rad(x) {
              return x * Math.PI / 180;
          }
            var list = document.getElementById('dist');
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = rad(p2.lat() - p1.lat());
            var dLong = rad(p2.lng() - p1.lng());
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode('Vzdálenost ' + d));
            list.appendChild(entry);
         //return d; // returns the distance in meter
        },
        
        /**
         * Funkce, ktera zobrazi trasu mezi body na mape
         * @method displayRoute
         * @param travelMode {travelMode} Mod cesty pro vypocet trasy
        */
        displayRoute: function(origin, destination, travelMode, routeOptions) {
            var routeTravelMode;
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true, polylineOptions: routeOptions });
            directionsDisplay.setMap(this.map);
            $(this.mapId).data(directionsDisplay.id, directionsDisplay);
            this.directionsArray.push(directionsDisplay);
            var start = origin;
            var end = destination;
            var waypoints = [];
            for (var i = 1; i < this.markers.length - 1; i++) { 
                waypoints.push({
                    location: $(this.mapId).data(this.markers[i]).getPosition(),
                    stopover: true
                });
            }
            
            switch(travelMode) {
                case 'driving': routeTravelMode = google.maps.TravelMode.DRIVING; break;
                case 'walking': routeTravelMode = google.maps.TravelMode.WALKING; break;
                case 'bicycling': routeTravelMode = google.maps.TravelMode.BICYCLING; break;
                case 'transit' : routeTravelMode = google.maps.TravelMode.TRANSIT; break;
                default : routeTravelMode = google.maps.TravelMode.DRIVING;
            }

            var request = {
              origin : start,
              destination : end,
              waypoints: waypoints,
              travelMode : routeTravelMode
            };
            directionsService.route(request, function(request, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(request);
                    var route = request.routes[0];
                    var routeInfo = document.getElementById("wholeRouteInfo");
                    
                    routeInfo.innerHTML = "";
                    routeInfo.innerHTML = "<b>Z: </b>" + route.legs[indexOfLeg].start_address + " <br /> ";
                    routeInfo.innerHTML += "<b>Do: </b>" + route.legs[indexOfLeg].end_address + " <br /> ";
                    routeInfo.innerHTML += "<b>Vzdálenost: </b>" + route.legs[indexOfLeg].distance.text + " <br /> ";
                    indexOfLeg++;
                }
            });
            //}
            
        },
        travelModeChange: function(travelMode){
            switch(travelMode) {
                case 'driving': travelingMod = google.maps.TravelMode.DRIVING; break;
                case 'walking': travelingMod = google.maps.TravelMode.WALKING; break;
                case 'bicycling': travelingMod = google.maps.TravelMode.BICYCLING; break;
                case 'transit' : travelingMod = google.maps.TravelMode.TRANSIT; break;
                default : travelingMod = google.maps.TravelMode.DRIVING;
            }
        },
        
        lengthOfRouteArray: function(indexOfRoute){
            var routeCoordinates = this.directionsArray[indexOfRoute].getDirections().routes[0].overview_path;
            return routeCoordinates.length;
        },
        getRouteCoordinatesLatLng: function(indexOfRoute){
            var routeCoordinates = this.directionsArray[indexOfRoute].getDirections().routes[0].overview_path;
            return routeCoordinates;
        },
        getRouteCoordinatesLngLat: function(indexOfRouteStep){
            var directionPoint = directionsDisplay.getDirections().routes[0].overview_path;
            var routeLat = directionPoint[indexOfRouteStep].lat();
            var routeLng = directionPoint[indexOfRouteStep].lng();
            var routercoord = routeLng + ', ' + routeLat;
            return routercoord;
        },
        getRouteStartAddress: function(indexOfRoute){
            var startaddress = directionsDisplay.getDirections().routes[0].legs[indexOfRoute].start_address;
            return startaddress;
        },
        getRouteEndAddress: function(indexOfRoute){
            var endaddress = directionsDisplay.getDirections().routes[0].legs[indexOfRoute].end_address;
            return endaddress;
        },
        getRouteDistanceKM: function(indexOfRoute){
            var routedistanceKM = directionsDisplay.getDirections().routes[0].legs[indexOfRoute].distance.text;
            return routedistanceKM;
        },
        
        /**
         * Funkce, ktera smaze trasu z mapy
         * @method clearRoutes
        */
        clearRoutes: function(){
            for(var i=0; i<this.directionsArray.length; i+=1){
                this.directionsArray[i].setMap(null);
                this.directionsArray.splice(i, 1);
            }
            //directionsArray = [];
        },
        
        /**
         * Funkce, která zobrazi vyskovy profil v grafu
         * @method displayElevate
         * @param path {array} pole bodů, jejichz spojovaci cesta je zanesena do grafu
         * @param divDisplay {div} div, kde se zobrazi graf
        */
        displayElevate: function(path, divDisplay) {
            
            google.load('visualization', '1', {packages: ['columnchart']});
            google.maps.event.addDomListener(window, 'load', initialize(path,divDisplay));
            google.setOnLoadCallback(initialize);

       /**
         * Funkce, která zobrazi vyskovy profil v grafu
         * @method initialize
         * @param path {array} pole bodů, jejichz spojovaci cesta je zanesena do grafu
         * @param divDisplay {div} div, kde se zobrazi graf
        */
            function initialize(path,divDisplay) {
                var elevator;

                elevator = new google.maps.ElevationService();
                chart = new google.visualization.ColumnChart(document.getElementById(divDisplay));
                var pathRequest = {
                    'path': path,
                    'samples': 160
                };
                
                elevator.getElevationAlongPath(pathRequest, plotElevation);
            }

            function plotElevation(results) {
                elevations = results;

                var elevationPath = [];
                for (var i = 0; i < results.length; i++) {
                    elevationPath.push(elevations[i].location);
                }

                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Vzorek');
                data.addColumn('number', 'Vyskovy profil');
                for (var i = 0; i < results.length; i++) {
                    data.addRow(['', elevations[i].elevation]);
                }

                var drawChart = {
                    height: 150,
                    legend: ' zadna / none',
                    titleY: 'Elevace / Elevation (m)'
                };
                chart.draw(data, drawChart);  
            }    
        },
        geocode: function(address, options) {
            var Gmapy = this;
            setTimeout(function() {
                geocoder.geocode({'address': address.address}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK && address.center)
                        Gmapy.map.setCenter(results[0].geometry.location);
                    if (status == google.maps.GeocoderStatus.OK && options && options.markerId)
                        options.markerId.setPosition(results[0].geometry.location);
                    else if (status == google.maps.GeocoderStatus.OK && options) {
                        if (Gmapy.lockGeocode) {
                            Gmapy.lockGeocode = false;
                            options.position = results[0].geometry.location;
                            options.geocode = true;
                            Gmapy.createMarker(options);
                        }
                    }
                    else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        Gmapy.geocode(address, options);
                    }
                });
            }, this.opts.delay);
        },
        geoMarker: function() {
            if (this.geoMarkers.length > 0 && !this.lockGeocode) {
                this.lockGeocode = true;
                var current = this.geoMarkers.splice(0, 1);
                this.geocode({address: current[0].address}, current[0]);
            }
            else if (this.lockGeocode) {
                var Gmapy = this;
                setTimeout(function() {
                    Gmapy.geoMarker();
                }, this.opts.delay);
            }
        },
        
        /**
         * Funkce, která nastaví mapu
         * @method setMap
         * @param options {options} nastaveni parametru mapy
        */
        setMap: function(options) {
            delete options.mapTypeId;
            if (options.address) {
                this.geocode({address: options.address, center: true});
                delete options.address;
            }
            else if (options.latitude && options.longitude) {
                options.center = new google.maps.LatLng(options.latitude, options.longitude);
                delete options.longitude;
                delete options.latitude;
            }
            if (options.mapTypeControlOptions && options.mapTypeControlOptions.position)
                options.mapTypeControlOptions.position = google.maps.ControlPosition[options.mapTypeControlOptions.position.toUpperCase()];
            if (options.mapTypeControlOptions && options.mapTypeControlOptions.style)
                options.mapTypeControlOptions.style = google.maps.MapTypeControlStyle[options.mapTypeControlOptions.style.toUpperCase()];
            if (options.navigationControlOptions && options.navigationControlOptions.position)
                options.navigationControlOptions.position = google.maps.ControlPosition[options.navigationControlOptions.position.toUpperCase()];
            if (options.navigationControlOptions && options.navigationControlOptions.style)
                options.navigationControlOptions.style = google.maps.NavigationControlStyle[options.navigationControlOptions.style.toUpperCase()];
            this.map.setOptions(options);
        },
        getMap: function() {
            return this.map;
        },
        
        /**
         * Funkce, která vytvori listener
         * @method createListener
         * @param type {type} typ objektu, na ktery plati udalost
         * @param event {event} druh udalosti
         * @param data {data} co se stane pri udalosti
        */
        createListener: function(type, event, data) {
            var target;
            if (typeof type != 'object')
                type = {type: type};
            if (type.type == 'map')
                target = this.map;
            else if (type.type == 'marker' && type.marker)
                target = $(this.mapId).data(type.marker);
            else if (type.type == 'info' && type.marker)
                target = $(this.mapId).data(type.marker + 'info');
            if (target)
                return google.maps.event.addListener(target, event, data);
            else if ((type.type == 'marker' || type.type == 'info') && this.getMarkerCount() != this.getTmpMarkerCount())
                var Gmapy = this;
            setTimeout(function() {
                Gmapy.createListener(type, event, data);
            }, this.opts.delay);
        },
        
       /**
         * Funkce, která vyjme listener
         * @method removeListener
        */
        removeListener: function(listener) {
            google.maps.event.removeListener(listener);
        },
        
        /**
         * Funkce, která nastavi info window
         * @method setInfoWindow
         * @param tmarker {marker} marker, na ktery ma byt vytvoreno info window
         * @param html {options} nastaveni parametru info window
        */
        setInfoWindow: function(tmarker, html, index) {
            var Gmapy = this;
            var marker = $(this.mapId).data(tmarker);
//            html.content = Gmapy.opts.html_prepend + html.content + Gmapy.opts.html_append;
            html.content = html.content;
            var infowindow = new google.maps.InfoWindow(html);
            this.infoWindowsArray.splice(index, 1);
            this.infoWindowsArray.push(infowindow);
            infowindow.show = false;
            $(Gmapy.mapId).data(marker.id + 'info', infowindow);
            if (html.popup) {
                Gmapy.openWindow(infowindow, marker, html);
                infowindow.show = true; 
            }
            google.maps.event.addListener(marker, 'click', function() { 
                if (openedInfoWindow != null) openedInfoWindow.close();
                infowindow.open(this.map, marker);
                openedInfoWindow = infowindow;
                google.maps.event.addListener(infowindow, 'closeclick', function() {
                    openedInfoWindow = null;
                });
            });
             
        },
        openWindow: function(infowindow, marker, html) {
            if (this.opts.oneInfoWindow)
                this.clearInfo();
            if (html.ajax) {
                infowindow.open(this.map, marker);
                $.ajax({
                    url: html.ajax,
                    success: function(html) {
                        infowindow.setContent(html);
                    }
                });
            }
            else if (html.id) {
                infowindow.setContent($(html.id).html());
                infowindow.open(this.map, marker);
            }
            else
                infowindow.open(this.map, marker);
        },
        getInfo: function(indexOfInfoWindow) {
//                var info = html.content;
//                return info;
            var infocontent = this.infoWindowsArray[indexOfInfoWindow].getContent();
            return infocontent;
                
	},
        closeInfo: function() {
             for (var i = 0, l = this.markers.length; i < l; i++) {
		var info = $(this.mapId).data(this.markers[i] + 'info');
		if(info) {
			info.close();
			info.show = false;
		}
             }
	},
        createPolyline: function(poly) {
            poly.type = 'polyline';
            return this.createOverlay(poly);
        },
        createPolygon: function(poly) {
            poly.type = 'polygon';
            return this.createOverlay(poly);
        },
        createCircle: function(poly) {
            poly.type = 'circle';
            return this.createOverlay(poly);
        },
        createRectangle: function(poly) {
            poly.type = 'rectangle';
            return this.createOverlay(poly);
        },
        createOverlay: function(poly) {
            var overlay = [];
            if (!poly.id) {
                this.count++;
                poly.id = this.opts.polyId + this.count;
            }
            switch (poly.type) {
                case 'polyline':
                    if (poly.coords.length > 0) {
                        for (var j = 0, l = poly.coords.length; j < l; j++)
                            overlay.push(new google.maps.LatLng(poly.coords[j].latitude, poly.coords[j].longitude));
                        overlay = new google.maps.Polyline({
                            map: this.map,
                            path: overlay,
                            strokeColor: poly.color ? poly.color : this.opts.polyline.color,
                            strokeOpacity: poly.opacity ? poly.opacity : this.opts.polyline.opacity,
                            strokeWeight: poly.weight ? poly.weight : this.opts.polyline.weight
                        });
                    }
                    else
                        return false;
                    break;
                case 'polygon':
                    if (poly.coords.length > 0) {
                        for (var j = 0, l = poly.coords.length; j < l; j++)
                            overlay.push(new google.maps.LatLng(poly.coords[j].latitude, poly.coords[j].longitude));
                        overlay = new google.maps.Polygon({
                            map: this.map,
                            path: overlay,
                            strokeColor: poly.color ? poly.color : this.opts.polygon.color,
                            strokeOpacity: poly.opacity ? poly.opacity : this.opts.polygon.opacity,
                            strokeWeight: poly.weight ? poly.weight : this.opts.polygon.weight,
                            fillColor: poly.fillColor ? poly.fillColor : this.opts.polygon.fillColor,
                            fillOpacity: poly.fillOpacity ? poly.fillOpacity : this.opts.polygon.fillOpacity
                        });
                    }
                    else
                        return false;
                    break;
                case 'circle':
                    overlay = new google.maps.Circle({
                        map: this.map,
                        center: new google.maps.LatLng(poly.latitude, poly.longitude),
                        radius: poly.radius,
                        strokeColor: poly.color ? poly.color : this.opts.circle.color,
                        strokeOpacity: poly.opacity ? poly.opacity : this.opts.circle.opacity,
                        strokeWeight: poly.weight ? poly.weight : this.opts.circle.weight,
                        fillColor: poly.fillColor ? poly.fillColor : this.opts.circle.fillColor,
                        fillOpacity: poly.fillOpacity ? poly.fillOpacity : this.opts.circle.fillOpacity
                    });
                    break;
                case 'rectangle':
                    overlay = new google.maps.Rectangle({
                        map: this.map,
                        bounds: new google.maps.LatLngBounds(new google.maps.LatLng(poly.sw.latitude, poly.sw.longitude), new google.maps.LatLng(poly.ne.latitude, poly.ne.longitude)),
                        strokeColor: poly.color ? poly.color : this.opts.circle.color,
                        strokeOpacity: poly.opacity ? poly.opacity : this.opts.circle.opacity,
                        strokeWeight: poly.weight ? poly.weight : this.opts.circle.weight,
                        fillColor: poly.fillColor ? poly.fillColor : this.opts.circle.fillColor,
                        fillOpacity: poly.fillOpacity ? poly.fillOpacity : this.opts.circle.fillOpacity
                    });
                    break;
                default:
                    return false;
                    break;
            }
            this.addOverlay(poly, overlay);
            return overlay;
        },
        addOverlay: function(poly, overlay) {
            $(this[this.overlays[poly.type].id]).data(poly.id, overlay);
            this[this.overlays[poly.type].array].push(poly.id);
        },
        setOverlay: function(type, overlay, options) {
            overlay = $(this[this.overlays[type].id]).data(overlay);
            if (options.coords && options.coords.length > 0) {
                var array = [];
                for (var j = 0, l = options.coords.length; j < l; j++)
                    array.push(new google.maps.LatLng(options.coords[j].latitude, options.coords[j].longitude));
                options.path = array;
                delete options.coords;
            }
            else if (options.ne && options.sw) {
                options.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(options.sw.latitude, options.sw.longitude), new google.maps.LatLng(options.ne.latitude, options.ne.longitude));
                delete options.ne;
                delete options.sw;
            }
            else if (options.latitude && options.longitude) {
                options.center = new google.maps.LatLng(options.latitude, options.longitude);
                delete options.latitude;
                delete options.longitude;
            }
            overlay.setOptions(options);
        },
        removeOverlay: function(type, overlay) {
            var index = $.inArray(overlay, this[this.overlays[type].array]), current;
            if (index > -1) {
                current = this[this.overlays[type].array].splice(index, 1);
                var markerId = current[0];
                $(this[this.overlays[type].id]).data(markerId).setMap(null);
                $(this[this.overlays[type].id]).removeData(markerId);
                return true;
            }
            return false;
        },
        clearOverlays: function(type) {
            for (var i = 0, l = this[this.overlays[type].array].length; i < l; i++) {
                var markerId = this[this.overlays[type].array][i];
                $(this[this.overlays[type].id]).data(markerId).setMap(null);
                $(this[this.overlays[type].id]).removeData(markerId);
            }
            this[this.overlays[type].array] = [];
        },
        showHideMarker: function(marker, display) {
            if (typeof display === 'undefined') {
                if (this.getVisibleMarker(marker)) {
                    $(this.mapId).data(marker).setVisible(false);
                    var info = $(this.mapId).data(marker + 'info');
                    if (info && info.show) {
                        info.close();
                        info.show = false;
                    }
                }
                else
                    $(this.mapId).data(marker).setVisible(true);
            }
            else
                $(this.mapId).data(marker).setVisible(display);
        },
        getMarkerCount: function() {
            return this.markers.length;
        },
        getTmpMarkerCount: function() {
            return this.tmpMarkers.length;
        },
        
        /**
         * Funkce, která vytvori marker
         * @method createMarker
         * @param marker {marker} nastaveni parametru markeru
        */
        createMarker: function(marker) {
            if (!marker.geocode) {
                this.count++;
                if (!marker.id)
                    marker.id = this.opts.prefixId + this.count;
                this.tmpMarkers.push(marker.id);
            }
            if (marker.address && !marker.geocode) {
                this.geoMarkers.push(marker);
                this.geoMarker();
            }
            else if (marker.latitude && marker.longitude || marker.position) {
                var options = {map: this.map};
                options.id = marker.id;
//                options.group = marker.group ? marker.group : this.opts.groupId;
//                options.zIndex = marker.zIndex ? marker.zIndex : 0;
//                options.zIndexOrg = marker.zIndexOrg ? marker.zIndexOrg : 0;
                if (marker.visible == false)
                    options.visible = marker.visible;
                if (marker.title)
                    options.title = marker.title;
                if (marker.draggable)
                    options.draggable = marker.draggable;
                if (marker.icon && marker.icon.image) {
                    options.icon = marker.icon.image;
                    if (marker.icon.shadow)
                        options.shadow = marker.icon.shadow;
                }
                else if (marker.icon)
                    options.icon = marker.icon;
                else if (this.opts.icon && this.opts.icon.image) {
                    options.icon = this.opts.icon.image;
                    if (this.opts.icon.shadow)
                        options.shadow = this.opts.icon.shadow;
                }
                else if (this.opts.icon)
                    options.icon = this.opts.icon;
                options.position = marker.position ? marker.position : new google.maps.LatLng(marker.latitude, marker.longitude);
                var cmarker = new google.maps.Marker(options);
                if (marker.html) {
                    if (!marker.html.content && !marker.html.ajax && !marker.html.id)
                        marker.html = {content: marker.html};
                    else if (!marker.html.content)
                        marker.html.content = null;
                    this.setInfoWindow(cmarker, marker.html);
                }
                this.addMarker(cmarker);
                return cmarker;
            }
        },
        addMarker: function(marker) {
            $(this.mapId).data(marker.id, marker);
            this.markers.push(marker.id);
        },
        setMarker: function(marker, options) {
            var tmarker = $(this.mapId).data(marker);
            delete options.id;
            delete options.visible;
            if (options.icon) {
                var toption = options.icon;
                delete options.icon;
                if (toption && toption == 'default') {
                    if (this.opts.icon && this.opts.icon.image) {
                        options.icon = this.opts.icon.image;
                        if (this.opts.icon.shadow)
                            options.shadow = this.opts.icon.shadow;
                    }
                    else if (this.opts.icon)
                        options.icon = this.opts.icon;
                }
                else if (toption && toption.image) {
                    options.icon = toption.image;
                    if (toption.shadow)
                        options.shadow = toption.shadow;
                }
                else if (toption)
                    options.icon = toption;
            }
            if (options.address) {
                this.geocode({address: options.address}, {markerId: tmarker});
                delete options.address;
                delete options.latitude;
                delete options.longitude;
                delete options.position;
            }
            else if (options.latitude && options.longitude || options.position) {
                if (!options.position)
                    options.position = new google.maps.LatLng(options.latitude, options.longitude);
            }
            tmarker.setOptions(options);
        },
        
        /**
         * Funkce, která vyjme marker
         * @method removeMarker
         * @param marker {marker} marker, ktery ma byt vyjmut
        */
        removeMarker: function(marker) {
            var index = $.inArray(marker, this.markers), actual;
            if (index >= -1) {
                //this.tmpMarkers.splice(index, 1);
                actual = this.markers.splice(index, 1);
                var markerId = actual[0];
                var marker = $(this.mapId).data(markerId);
                var info = $(this.mapId).data(markerId + 'info');
                marker.setVisible(false);
                marker.setMap(null);
                $(this.mapId).removeData(markerId);
                if (info) {
                    info.close();
                    info.show = false;
                    $(this.mapId).removeData(markerId + 'info');
                }
                return true;
            }
            return false;
        },
        
        /**
         * Funkce, která odstrani vsechny markery
         * @method clearMarkers
        */
        clearMarkers: function() {
            for (var i = 0, l = this.markers.length; i < l; i++) {
                var markerId = this.markers[i];
                var marker = $(this.mapId).data(markerId);
                var info = $(this.mapId).data(markerId + 'info');
                marker.setVisible(false);
                marker.setMap(null);
                $(this.mapId).removeData(markerId + 'info');
                if (info) {
                    info.close();
                    info.show = false;
                    $(this.mapId).removeData(markerId);
                }
            }
            this.singleMarker = false;
            this.lockGeocode = false;
            this.markers = [];
            this.tmpMarkers = [];
            this.geoMarkers = [];
        }    
    } 
    
})(jQuery);
