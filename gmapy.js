(function($) {
    
  /***************************************************************************/
  /*                           GMAPY GLOBALS / GLOBÁLNÍ PROMĚNNÉ             */
  /***************************************************************************/
    var directionInfo = {};
    var geolocCoords = {};
    var getaddressresult = {};
    var directionsDisplay;
    var directionsService;
    var indexOfLeg = 0;
    var chart;
    var mousemarker = null;
    var travelingMod;
    var elevator = null;
    var elevations = null;
    var openedInfoWindow = null;
    var drawingManager;
    var coordinatesDrawingM = [];
    var polygonsDrawingM = [];
    var all_overlays = [];
    var selectedShape;
    var colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
    var selectedColor;
    var colorButtons = {};
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
    
  /***************************************************************************/
  /*                  GMAPY DEFAULTS / DEFAULTNÍ NASTAVENÍ                   */
  /***************************************************************************/
    
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
            maptype: 'SATELITE', 
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
        
        //
    
  /***************************************************************************/
  /*                    GMAPY INITIALIZATION / INICIALIZACE MAPY             */
  /***************************************************************************/
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
        
        /**
         * Perform code of entered function after bounds of map changed.
         * @method ready
         * @param f {function}  function called after bounds of map changed
         * @returns {function}  return function performed code
         */
        /*
         * Vykoná kód vložené funkce, po změně hranic mapy.
         * @method ready
         * @param f {function}  funkce, která se vyvolá po změně hranic mapy
         * @returns {function}  vrátí funkcí vykonávaný kód
         */
        ready: function(f) {
            google.maps.event.addListenerOnce(this.map, 'bounds_changed', function() {
                return f();
            });
        },
        
        
        /**
         * Set the map options
         * @method setMap
         * @param options {object} set options of the map
        */
        /*
         * Nastaví mapu podle zadaných vlastností
         * @method setMap
         * @param options {object} nastaveni vlastností mapy
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
        
        /**
         * Get the map
         * @method getMap
         * @returns {object}  return return map object
        */
        /*
         * Získá mapu
         * @method getMap
         * @returns {object}  return vrátí mapu jako objekt
        */
        getMap: function() {
            return this.map;
        },
        
  /***************************************************************************/
  /*                            GMAPY OVERLAYS                               */
  /***************************************************************************/
       
       /**
         * Allows to add a google maps Ground Overlay.
         * @method groundOverlay
         * @param url {string} URL of the picture to display on the map
         * @param bounds {object} LatLngBounds specified coordinates
         * @param groundOpt {object} ground overlay options acording Google Maps documentation
        */
       /*
         * Dovoluje přidat google maps Ground Overlay.
         * @method groundOverlay
         * @param url {string} URL obrázku, který bude zobrazen na mapě
         * @param bounds {object} souřadnice zadané jako LatLngBounds
         * @param groundOpt {object} volby ground overlay podle dokumentace Google Maps
        */ 
        groundOverlay: function(url, bounds, groundOpt) {
            var groundoverlay;
            groundoverlay = new google.maps.GroundOverlay(url, bounds, groundOpt);
            groundoverlay.setMap(this);
        },
        
        /**
         * Show or hide marker on the map.
         * @method showHideMarker
         * @param marker {object}  marker, which will be displayed or hidden 
         * @param display {boolean}  true - show marker, false - hide marker
         */
        /*
         * Zobrazí nebo skryje marker na mapě.
         * @method showHideMarker
         * @param marker {object}  marker, který bude zobrazen nebo skryt
         * @param display {boolean} true - zobrazí marker, false - skryje marker
         */
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
        
        /**
         * Function which returns count of markers on the map
         * @method getMarkerCount
         * @return {int} return marker count on the map
         */
        /*
         * Funkce, která vrací počet markerů na mapě
         * @method getMarkerCount
         * @return {int} vrátí počet markerů v mapě
         */
        getMarkerCount: function() {
            return this.markers.length;
        },
        
        /*
         * Function which returns count of markers on the map
         * @method getTmpMarkerCount
         * @return {int} return marker count on the map
         */
        /*
         * Funkce, která vrací počet markerů na mapě
         * @method getTmpMarkerCount
         * @return {int} vrátí počet markerů v mapě
         */
        getTmpMarkerCount: function() {
            return this.tmpMarkers.length;
        },

        /**
         * Create marker on the map
         * @method createMarker
         * @param marker {object}  options of the marker, accepts any option defined in google.maps.MarkerOptions
         * @returns cmarker {google.maps.Marker}  return marker
         */
        /*
         * Vytvoří marker na mapě
         * @method createMarker
         * @param marker {object}  vlastnosti nastavené markeru, akceptuje nastavení definovaná v google.maps.MarkerOptions
         * @returns cmarker {google.maps.Marker}  vrátí marker
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
        
        /**
         * Add marker to the array of maarkers
         * @method addMarker
         * @param marker {object}  added marker to array of markers
         */
        /*
         * Přidá marker do pole markerů
         * @method addMarker
         * @param marker {object}  marker přidaný do pole markerů
         */
        addMarker: function(marker) {
            $(this.mapId).data(marker.id, marker);
            this.markers.push(marker.id);
        },
        
        /**
         * Set chosen marker options
         * @method setMarker
         * @param marker {object}  edited marker
         * @param options {object}  new marker options
         */
        /*
         * Nastaví vybranému markeru vlastnosti
         * @method setMarker
         * @param marker {object}  marker, který bude upravován
         * @param options {object}  nové vlastnosti nastavené markeru
         */
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
         * Remove marker from map and array of markers
         * @method removeMarker
         * @param marker {object} marker which will be removed
        */
        /*
         * Vyjme marker z mapy a pole markerů
         * @method removeMarker
         * @param marker {object} marker, který bude vyjmut
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
         * Clear all markers from map and array of markers
         * @method clearMarkers
        */
        /*
         * Vymaže všechny markery z mapy a pole markerů
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
         * Set Info Window of marker and add it to array
         * @method setInfoWindow
         * @param tmarker {object} marker which info window will be set up
         * @param html {object} options of info window
         * @param index {int} info window array index
        */
        /*
         * Nastaví Info Window markeru a přidá jej do pole
         * @method setInfoWindow
         * @param tmarker {object} marker, jehož info window bude nastaveno
         * @param html {object} vlastnosti info window
         * @param index {int} index info window v poli.
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
        
        /*
         * Set Info Window of marker and add it to array
         * @method openWindow
         * @param infowindow {object} marker which info window will be set up
         * @param marker {object} options of info window
         * @param html {int} info window array index
        */
        /*
         * Otevře Info Window vybraného markeru
         * @method openWindow
         * @param infowindow {object} 
         * @param marker {object} vlastnosti info window
         * @param html {int} index info window v poli.
        */
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
        
        /**
         * Get content of info window stored in array of info windows
         * @method getInfo
         * @param indexOfInfoWindow {int} index of info window in array
         * @returns infocontent {string}  return content of info window as a text
        */
        /*
         * Získá obsah info window uloženého v poli info windows
         * @method getInfo
         * @param indexOfInfoWindow {int} index info window v poli
         * @returns infocontent {string}  vrátí obsah info window v textové podobě
        */
        getInfo: function(indexOfInfoWindow) {
//                var info = html.content;
//                return info;
            var infocontent = this.infoWindowsArray[indexOfInfoWindow].getContent();
            return infocontent;
                
	},
        
        /**
         * Close all Info Windows
         * @method closeInfo
        */
        /*
         * Zavře všechna Info Window
         * @method closeInfo
        */
        closeInfo: function() {
             for (var i = 0, l = this.markers.length; i < l; i++) {
		var info = $(this.mapId).data(this.markers[i] + 'info');
		if(info) {
			info.close();
			info.show = false;
		}
             }
	},
        
        /**
         * Create polyline with set options
         * @method createPolyline
         * @param poly {object} set options of polyline
         * @returns {object}  return polyline displayed on the map
        */
        /*
         * Vytvoří křivku se zadanými vlastnostmi
         * @method createPolyline
         * @param poly {object} zadané vlastnosti křivky
         * @returns {object}  vrátí křivku zobrazenou na mapě
        */
        createPolyline: function(poly) {
            poly.type = 'polyline';
            return this.createOverlay(poly);
        },
        
        /**
         * Create polygon with set options
         * @method createPolygon
         * @param poly {object} set options of polygon
         * @returns {object}  return polygon displayed on the map
        */
        /*
         * Vytvoří polygon se zadanými vlastnostmi
         * @method createPolygon
         * @param poly {object} zadané vlastnosti polygonu
         * @returns {object}  vrátí polygon zobrazený na mapě
        */
        createPolygon: function(poly) {
            poly.type = 'polygon';
            return this.createOverlay(poly);
        },
        
        /**
         * Create circle with set options
         * @method createCircle
         * @param poly {object} set options of circle
         * @returns {object}  return circle displayed on the map
        */
        /*
         * Vytvoří kruh se zadanými vlastnostmi
         * @method createCircle
         * @param poly {object} zadané vlastnosti kruhu
         * @returns {object}  vrátí kruh zobrazený na mapě
        */
        createCircle: function(poly) {
            poly.type = 'circle';
            return this.createOverlay(poly);
        },
        
        /**
         * Create rectangle with set options
         * @method createRectangle
         * @param poly {object} set options of rectangle
         * @returns {object}  return rectangle displayed on the map
        */
        /*
         * Vytvoří obdélník se zadanými vlastnostmi
         * @method createRectangle
         * @param poly {object} zadané vlastnosti obdélníku
         * @returns {object}  vrátí obdélník zobrazený na mapě
        */
        createRectangle: function(poly) {
            poly.type = 'rectangle';
            return this.createOverlay(poly);
        },
        
        /**
         * Create shape (polyline, polygon, circle, rectangle)
         * @method createOverlay
         * @param poly {object} set options of shape
         * @returns overlay {object}  return shape displayed on the map
        */
        /*
         * Vytvoří tvar (křivka, polygon, kruh, obdélník)
         * @method createOverlay
         * @param poly {object} zadané vlastnosti tvaru
         * @returns overlay {object}  vrátí tvar zobrazený na mapě
        */
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
        
        /**
         * Add shape to array
         * @method addOverlay
         * @param poly {object} set options of shape
         * @param overlay {object} shape which will be added to array (polyline, polygon, circle, rectangle)
        */
        /*
         * Přidá tvar do pole
         * @method addOverlay
         * @param poly {object} zadané vlastnosti tvaru
         * @param overlay {object} tvar, který bude přidán do pole (křivka, polygon, kruh, obdélník)
        */
        addOverlay: function(poly, overlay) {
            $(this[this.overlays[poly.type].id]).data(poly.id, overlay);
            this[this.overlays[poly.type].array].push(poly.id);
        },
        
        /**
         * Set new options of existing shape
         * @method setOverlay
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
         * @param overlay {string} name of shape (id)
         * @param options {object} new options of shape
        */
        /*
         * Nastaví existujícímu tvaru nové vlastnosti
         * @method setOverlay
         * @param type {string} název tvaru (možnosti: polyline, polygon, circle nebo rectangle)
         * @param overlay {string} název tvaru (id)
         * @param options {object} nové vlastnosti nastavené tvaru
        */
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
        
        /**
         * Remove shape from map and array
         * @method removeOverlay
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
         * @param overlay {string} name of shape (id)
        */
        /*
         * Vyjme tvar z mapy a pole 
         * @method removeOverlay
         * @param type {string} název tvaru (možnosti: polyline, polygon, circle nebo rectangle)
         * @param overlay {string} název tvaru (id)
        */
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
        
        /**
         * Clear all shapes acording type from map and array
         * @method clearOverlays
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
        */
        /*
         * Vymaže tvary podle typu z mapy a pole 
         * @method clearOverlays
         * @param type {string} název tvaru (možnosti: polyline, polygon, circle nebo rectangle)
        */
        clearOverlays: function(type) {
            for (var i = 0, l = this[this.overlays[type].array].length; i < l; i++) {
                var markerId = this[this.overlays[type].array][i];
                $(this[this.overlays[type].id]).data(markerId).setMap(null);
                $(this[this.overlays[type].id]).removeData(markerId);
            }
            this[this.overlays[type].array] = [];
        },
        
  /***************************************************************************/
  /*                            GMAPY LAYERS / VRSTVY                        */
  /***************************************************************************/
  
        /**
         * Add classic layer to map (traffic, transit nebo bicycling)
         * @method addLayer
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
        */
        /*
         * Přidá klasickou vrstvu do mapy (traffic, transit nebo bicycling) 
         * @method addLayer
         * @param layerName {string} název vrstvy (možnosti: traffic, transit, bicycling)
        */
        addLayer: function(layerName){
            var layer;
          switch(layerName) {
                case 'traffic': layer = new google.maps.TrafficLayer();
                break;
                case 'transit': layer = new google.maps.TransitLayer();
                break;
                case 'bicycling': layer = new google.maps.BicyclingLayer();
                break; 
          }
          layer.setMap(this.map);

        },
        
        /**
         * Get data from fusion tables
         * @method getFromFusionTables
         * @param options {object} options for fusion tables layer acording google maps
        */
        /*
         * Získá data z fusion tables 
         * @method getFromFusionTables
         * @param options {object} vlastnosti pro fusion tables vrstvu podle google maps
        */
        getFromFusionTables: function(options) {         
             var layer = new google.maps.FusionTablesLayer(options);
             layer.setMap(this.map);   
	},
        
        /**
         * Display kml on map from URL address
         * @method kmlLayer
         * @param kmladress {String} URL adresa kml souboru
        */
        /*
         * Zobrazí kml na mapě ze zvolené URL adresy
         * @method kmlLayer
         * @param kmladress {String} URL adresa kml souboru
        */
        kmlLayer: function(kmladress) {
            var kmlLayer = new google.maps.KmlLayer({
                url: kmladress, 
                map: this.map
            });

        },
        
        /**
         * Parse kml file and show result on map
         * @method parseKML
         * @param kmlfile {String} URL adresa kml souboru
        */
        /*
         * Parsuje kml soubor a zobrazí výsledek na mapě
         * @method parseKML
         * @param kmlfile {String} kml format
        */
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
         * Create heat map layer on the map from entered data
         * @method heatmapLayer
         * @param data {array} array of latitude longitude coordinates
        */
        /*
         * Vytvoří heat map vrstvu na mapě ze zadaných dat
         * @method heatmapLayer
         * @param data {array} pole latitude longitude souřadnic
        */
        heatmapLayer: function(data){
            var pointArray = new google.maps.MVCArray(data);
            var heatmap = new google.maps.visualization.HeatmapLayer({
                data: pointArray
            });
             heatmap.setMap(this.map);
        },
        
        
  /***************************************************************************/
  /*                    GMAPY COORDINATES  / SOUŘADNICE                      */
  /***************************************************************************/
        
        /**
         * Return longitude and latitude coordinates separated by comma in reversed order
         * @method getCoordinatesLngLat
         * @param point {object} point on map
         * @return LnglatStr6 {String} return longitude latitude coordinates separated by comma
        */
        /*
         * Vrátí v opačném pořadí longitude a latitude souradnice oddelene carkou
         * @method getCoordinatesLngLat
         * @param point {object} bod na mape
         * @return LnglatStr6 {String} vrací longitude latitude souřadnice oddělené čárkou
        */
        getCoordinatesLngLat: function(point){
            var LnglatStr6 = point.latLng.lng().toFixed(6) + ', ' + point.latLng.lat().toFixed(6);
            return LnglatStr6;
        },
        
        /**
         * Return latitude and longitude coordinates separated by comma
         * @method getCoordinatesLatLng
         * @param point {object} point on map
         * @return LnglatStr6 {String} return latitude and longitude coordinates separated by comma
        */
        /*
         * Vrátí latitude a longitude souradnice oddelene carkou
         * @method getCoordinatesLatLng
         * @param point {object} bod na mape
         * @return LnglatStr6 {String} vrací latitude longitude souřadnice oddělené čárkou
        */
        getCoordinatesLatLng: function(point){
            var LnglatStr6 = point.latLng.lat().toFixed(6) + ', ' + point.latLng.lng().toFixed(6);
            return LnglatStr6;
        },
        
        /**
         * Return coordinates longitude latitude in reverse order
         * @method getMarkerCoordinatesLngLat
         * @param indexOfMarker {int} index of marker in markers array
         * @return markercoord {string} return longitude latitude coordinates of marker
         */
        /*
         * Vrátí souřadnice longitude latitude v opačném pořadí
         * @method getMarkerCoordinatesLngLat
         * @param indexOfMarker {int} index markeru v poli markerů
         * @return markercoord {string} vrátí longitude latitude souřadnice markeru
         */
        getMarkerCoordinatesLngLat: function(indexOfMarker){
            var markerInArray = $(this.mapId).data(this.markers[indexOfMarker]);
            var markercoordLat = markerInArray.getPosition().lat();
            var markercoordLng = markerInArray.getPosition().lng();
            var markercoord = markercoordLng + ', ' + markercoordLat;
            return markercoord;
        },
        
        /**
         * Return coordinates latitude longitude of specific marker from array
         * @method getMarkerCoordinatesLatLng
         * @param indexOfMarker {int} index of marker in markers array
         * @return markercoord {string} return latitude longitude coordinates of marker
         */
        /*
         * Vrátí souřadnice latitude longitude konkrétního markeru v poli
         * @method getMarkerCoordinatesLatLng
         * @param indexOfMarker {int} index markeru v poli markerů
         * @return markercoord {string} vrátí latitude longitude souřadnice markeru
         */
        getMarkerCoordinatesLatLng: function(indexOfMarker){
            var markerInArray = $(this.mapId).data(this.markers[indexOfMarker]);
            var markercoord = markerInArray.position.toUrlValue();
            return markercoord;
        },
        
        /**
         * Return latitude longitude coordinates of specific direction from array
         * @method getRouteCoordinatesLatLng
         * @param indexOfRoute {int} index of direction in directions array
         * @return routeCoordinates {array} return array of latitude longitude coordinates of route
         */
        /*
         * Vrátí souřadnice latitude longitude konkrétní trasy v poli
         * @method getRouteCoordinatesLatLng
         * @param indexOfRoute {int} index trasy v poli tras
         * @return routeCoordinates {array} vrátí pole latitude longitude souřadnic trasy
         */
        getRouteCoordinatesLatLng: function(indexOfRoute){
            var routeCoordinates = this.directionsArray[indexOfRoute].getDirections().routes[0].overview_path;
            return routeCoordinates;
        },
        
        /**
         * Return longitude latitude coordinates of specific direction from array in reverse order
         * @method getRouteCoordinatesLngLat
         * @param indexOfRouteStep {int} index of direction in directions array
         * @return routercoord {string} return longitude latitude coordinates of route
         */
        /*
         * Vrátí v opačném pořadí souřadnice longitude latitude konkrétní trasy v poli
         * @method getRouteCoordinatesLngLat
         * @param indexOfRouteStep {int} index trasy v poli tras
         * @return routercoord {string} vrátí longitude latitude souřadnice trasy
         */
        getRouteCoordinatesLngLat: function(indexOfRouteStep){
            var directionPoint = directionsDisplay.getDirections().routes[0].overview_path;
            var routeLat = directionPoint[indexOfRouteStep].lat();
            var routeLng = directionPoint[indexOfRouteStep].lng();
            var routercoord = routeLng + ', ' + routeLat;
            return routercoord;
        },
        
        /**
         * Return latitude coordinate after geolocation
         * @method getGeolocateLatitude
         * @return {object} return latitude coordinate after geolocation
         */
        /*
         * Vrátí latitude souřadnici po geolokaci
         * @method getGeolocateLatitude
         * @return {object} vrátí latitude souřadnici po geolokaci
         */
        getGeolocateLatitude: function(){
            return geolocCoords.coordLatitude;
        },
        
        /**
         * Return longitude coordinate after geolocation
         * @method getGeolocateLongitude
         * @return {object} return longitude coordinate after geolocation
         */
        /*
         * Vrátí longitude souřadnici po geolokaci
         * @method getGeolocateLongitude
         * @return {object} vrátí longitude souřadnici po geolokaci
         */
        getGeolocateLongitude: function(){
            return geolocCoords.coordLongitude;
        },
        
        /*
         * Drawing Manager coordinates to array
         * @method drawingManagerCoordinatesToArray
         * @param polygon {object} 
         */
        /*
         * Drawing Manager souřadnice do pole
         * @method drawingManagerCoordinatesToArray
         * @param polygon {object} 
         */
        drawingManagerCoordinatesToArray: function(polygon) {
              polygonsDrawingM.push(polygon);
              var polygonBounds = polygon.getPath();
              for(var i = 0 ; i < polygonBounds.length ; i++){
                    coordinatesDrawingM.push(polygonBounds.getAt(i).lat(), polygonBounds.getAt(i).lng());
              }
        },
        
  /***************************************************************************/
  /*                   GMAPY SERVICES  / SLUŽBY                              */
  /***************************************************************************/ 
        
        /**
         * Display formatted address from latitude longitude coordinates into div element
         * @method getAddress
         * @param latLng {object} latitude longitude coordinates
         * @param divFormattedAddress {object} div in which will be displayed formatted address
        */
        /*
         * Zobrazí formatovanou adresu z latitude longitude souřadnic do zadaného div elementu
         * @method getAddress
         * @param latLng {object} latitude longitude souřadnice
         * @param divFormattedAddress {object} div, ve kterém bude zobrazena formátovaná adresa
        */
        getAddress: function(latLng, divFormattedAddress){
            geocoder.geocode( {'latLng': latLng},
            function(results, status) {          
                if(status == google.maps.GeocoderStatus.OK) {
                    if(results[0]) {
                       divFormattedAddress.innerHTML = results[0].formatted_address;
                    }
                    else {
                        divFormattedAddress.innerHTML = "No results";
                    }
                }
                else {
                    divFormattedAddress.innerHTML = status;
                    
                }
            });
        },

        /**
	 * Convert kilometres to miles
         * @method kilometresToMiles
	 * @param km {float} kilometres
	 * @returns {float} return result in miles
	 */
        /*
	 * Převádí kilometry na míle
         * @method kilometresToMiles
	 * @param km {float} kilometry
	 * @returns {float} vrátí výsledek v mílích
	 */
	kilometresToMiles: function(km) {
		return km / 1.609344;
	},

	/**
	 * Convert miles to kilometres
         * @method milesToKilometres
	 * @param miles {float} miles
	 * @returns {float} return result in kilometres
	 */
        /*
	 * Převádí míle na kilometry
         * @method milesToKilometres
	 * @param miles {float} míle
	 * @returns {float} vrátí výsledek v kilometrech
	 */
	milesToKilometres: function(miles) {
		return miles * 1.609344;
	},
        
        /**
	 * Convert meters to miles
         * @method metersToMiles
	 * @param meters {float} meters
	 * @returns {float} return result in miles
	 */
        /*
	 * Převádí metry na míle
         * @method metersToMiles
	 * @param meters {float} metry
	 * @returns {float} vrátí výsledek v mílích
	 */
        metersToMiles: function(meters){  
            return meters*0.000621371192;
        },
        
        /**
	 * Convert miles to meters
         * @method milesToMeters
	 * @param miles {float} míle
	 * @returns {float} return result in meters
	 */
        /*
	 * Převádí míle na metry
         * @method milesToMeters
	 * @param miles {float} míle
	 * @returns {float} vrátí výsledek v metrech
	 */
        milesToMeters: function(miles){  
            return miles*1609.344;
        },
        
        /**
         * Return distance between two points in metres
         * @method getDistance
         * @param p1 {object} starting point in latitude longitude coordinates
         * @param p2 {object} ending point in latitude longitude coordinates
         * @returns distanceKM {float} return distance in kilometres
        */
        /*
         * Vrací vzdálenost mezi dvěma body v metrech
         * @method getDistance
         * @param p1 {object} počáteční bod v latitude longitude souřadnicích
         * @param p2 {object} koncový bod v latitude longitude souřadnicích
         * @returns distanceKM {float} vrátí vzdálenost v kilometrech
        */
        getDistance: function(p1, p2) {
          
            function rad(x) {
              return x * Math.PI / 180;
            }
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = rad(p2.lat() - p1.lat());
            var dLong = rad(p2.lng() - p1.lng());
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            var distanceKM = Math.round(d / 100) / 10;
            return distanceKM; // returns the distance in kilometer
        },
        
        /**
         * Allow display direction path in textual form in the choosen div element
         * @method textDirections
         * @param divPanel {object} starting point in latitude longitude coordinates
        */
        /*
         * Umožní zobrazit trasu v textové podobě ve zvoleném div elementu
         * @method textDirections
         * @param divPanel {object} počáteční bod v latitude longitude souřadnicích
        */
        textDirections: function(divPanel) {
              directionsDisplay.setPanel(document.getElementById(divPanel));
        },
        
        /**
         * Display direction between points on the map
         * @method displayRoute
         * @param origin {object} coordinates of starting point
         * @param destination {object} coordinates of ending point
         * @param travelMode {string} direction mode for computing route (options: driving (default), walking, bicycling, transit)
         * @param routeOptions {object} direction options acording google maps api
        */
        /*
         * Zobrazí trasu mezi body na mapě
         * @method displayRoute
         * @param origin {object} souřadnice počátečního bodu
         * @param destination {object} souřadnice koncového bodu
         * @param travelMode {string} mód cesty pro výpočet trasy (možnosti: driving (defaultně), walking, bicycling, transit)
         * @param routeOptions {object} vlastnosti trasy podle google maps api
        */
        displayRoute: function(origin, destination, travelMode, routeOptions) {
            var routeTravelMode;
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer({ preserveViewport: true, suppressMarkers: true, polylineOptions: routeOptions });
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
                    directionInfo.routeRequest = route;
                     for (var i = 0; i < route.legs.length; i++) {
                        directionInfo.startAddress = route.legs[i].start_address;
                        directionInfo.endAddress = route.legs[i].end_address;
                        directionInfo.durationRoute = route.legs[i].duration.text;
                        directionInfo.distanceRoute = route.legs[i].distance.text;
                     }

//                    var routeInfo = document.getElementById("routeSteps");
//                    var ul=document.createElement('ulRoute');
//                    var li=document.createElement('liRoute');
//                    routeInfo.appendChild(ul);
//                    ul.appendChild(li);
//                    
//                    li.innerHTML = "";
//                    li.innerHTML = "<b>Z: </b>" + route.legs[indexOfLeg].start_address + " <br /> ";
//                    li.innerHTML += "<b>Do: </b>" + route.legs[indexOfLeg].end_address + " <br /> ";
//                    li.innerHTML += "<b>Doba: </b>" + route.legs[indexOfLeg].duration.text + "<br />";
//                    li.innerHTML += "<b>Vzdálenost: </b>" + route.legs[indexOfLeg].distance.text + " <br /> <br /> ";
//                    computeTotalDistance(request);
                }
            });
            //}  
        },
        
        /**
         * Clear route from map and array
         * @method clearRoutes
        */
        /*
         * Smaže trasu z mapy a pole
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
         * Return request from created route
         * @method getRouteRequest
         * @returns {object} return request from created route
        */
        /*
         * Vrátí request z vytvořené trasy
         * @method getRouteRequest
         * @returns {object} vrátí request z vytvořené trasy
        */
        getRouteRequest: function(){  
            return directionInfo.routeRequest;
        },
        
        /**
         * Return address of starting point from created route
         * @method getStartAddress
         * @returns {object} return address of starting point from created route
        */
        /*
         * Vrátí adresu počátečního bodu z vykreslené trasy
         * @method getStartAddress
         * @returns {object} vrátí adresu počátečního bodu z vykreslené trasy
        */
        getStartAddress: function(){
            return directionInfo.startAddress;
        },
        
        /**
         * Return address of ending point from created route
         * @method getEndAddress
         * @returns {object} return address of ending point from created route
        */
        /*
         * Vrátí adresu koncového bodu z vykreslené trasy
         * @method getEndAddress
         * @returns {object} vrátí adresu koncového bodu z vykreslené trasy
        */
        getEndAddress: function(){
            return directionInfo.endAddress;
        },
        
        /**
         * Return total time in hours and minutes, required for travelling displayed route
         * @method getDurationRoute
         * @returns {object} return total time in hours and minutes
        */
        /*
         * Vrátí celkový čas v hodinách a minutách, potřebný pro projetí vykreslené trasy
         * @method getDurationRoute
         * @returns {object} vrátí celkový čas v hodinách a minutách
        */
        getDurationRoute: function(){
            return directionInfo.durationRoute;
        },
        
        /**
         * Return total distance in kilometres between route points
         * @method getDistanceRoute
         * @returns {object} return total distance in kilometres of route
        */
        /*
         * Vrátí celkovou vzdálenost v kilometrech mezi body na vykreslené trase
         * @method getDistanceRoute
         * @returns {object} vrátí celkovou vzdálenost mezi body trasy
        */
        getDistanceRoute: function(){
            return directionInfo.distanceRoute;
        },
        
        /**
         * Set travel mode for direction(možnosti: driving, walking, bicycling, transit)
         * @method travelModeChange
         * @param travelMode {string} travel mode 
         * @returns travelingMod {object} return travel mode
        */
        /*
         * Nastaví mód cesty pro trasu (možnosti: driving, walking, bicycling, transit)
         * @method travelModeChange
         * @param travelMode {string} mód cesty
         * @returns travelingMod {object} vrátí mód cesty
        */
        travelModeChange: function(travelMode){
            switch(travelMode) {
                case 'driving': travelingMod = google.maps.TravelMode.DRIVING; break;
                case 'walking': travelingMod = google.maps.TravelMode.WALKING; break;
                case 'bicycling': travelingMod = google.maps.TravelMode.BICYCLING; break;
                case 'transit' : travelingMod = google.maps.TravelMode.TRANSIT; break;
                default : travelingMod = google.maps.TravelMode.DRIVING;
            }
            return travelingMod;
        },
        
        lengthOfRouteArray: function(indexOfRoute){
            var routeCoordinates = this.directionsArray[indexOfRoute].getDirections().routes[0].overview_path;
            return routeCoordinates.length;
        },
        
        /*
         * Set travel mode for direction(možnosti: driving, walking, bicycling, transit)
         * @method getRouteStartAddress
         * @param indexOfRoute {int} travel mode 
         * @returns startaddress {object} return travel mode
        */
        /*
         * Nastaví mód cesty pro trasu (možnosti: driving, walking, bicycling, transit)
         * @method getRouteStartAddress
         * @param indexOfRoute {int} mód cesty
         * @returns startaddress {object} vrátí
        */
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
         * Display value of elevation after event in the created div element 
         * @method getElevation
         * @param event {object} event acording google maps
         * @param placeElevation {string} name of object in which will be displayed elevation value
        */
        /*
         * Zobrazí hodnotu výškového profilu po uskutečnění zadané události ve vytvořeném div elementu 
         * @method getElevation
         * @param event {object} označení události podle google maps
         * @param placeElevation {string} název objektu, ve kterém se zobrazí hodnota výškového profilu
        */
        getElevation: function(event, placeElevation){
            elevator = new google.maps.ElevationService();

                    var locations = [];

                    locations.push(event.latLng);

                    // Create a LocationElevationRequest object using the array's one value
                    var positionalRequest = {
                      'locations': locations
                    };
                    elevator.getElevationForLocations(positionalRequest, function(results, status) {
                        if (status == google.maps.ElevationStatus.OK) {
                            // Retrieve the first result
                            if (results[0]) {
                              var list = document.getElementById(placeElevation);
                              list.innerHTML = results[0].elevation;
                            } else {
                              alert("No results found");
                            }
                        } else {
                            alert("Elevation service failed due to: " + status);
                        }
                    });
        },
        
        /**
         * Display elevation graph
         * @method displayElevate
         * @param path {array} array of points which will be represented as a graph
         * @param divDisplay {object} div for displaying graph
        */
        /*
         * Zobrazí výškový profil v grafu
         * @method displayElevate
         * @param path {array} pole bodů,které budou reprezentovány jako graf
         * @param divDisplay {object} div pro zobrazení grafu
        */
        displayElevate: function(path, divDisplay) {
            
            google.load('visualization', '1', {packages: ['columnchart']});
            google.maps.event.addDomListener(window, 'load', initialize(path,divDisplay));
            google.setOnLoadCallback(initialize);
            
       /*
         * Funkce, která zobrazi vyskovy profil v grafu
         * @method initialize
         * @param path {array} pole bodů, jejichz spojovaci cesta je zanesena do grafu
         * @param divDisplay {div} div, kde se zobrazi graf
        */
            function initialize(path,divDisplay) {

                elevator = new google.maps.ElevationService();
                chart = new google.visualization.ColumnChart(document.getElementById(divDisplay));
                var pathRequest = {
                    'path': path,
                    'samples': 160
                };
                
                google.visualization.events.addListener(chart, 'onmouseover', function(e) {
      if (mousemarker == null) {
        mousemarker = new google.maps.Marker({
          position: elevations[e.row].location,
          map: this.map,
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });
        var contentStr = "elevation="+elevations[e.row].elevation+"<br>location="+elevations[e.row].location.toUrlValue(6);

      } else {
        var contentStr = "elevation="+elevations[e.row].elevation+"<br>location="+elevations[e.row].location.toUrlValue(6);
        mousemarker.setPosition(elevations[e.row].location);
        // if (mm_infowindow_open) infowindow.open(map,mousemarker);
      }
    });
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
        
        /**
         * Provides geocoding
         * @method geocode
         * @param address {object} address
         * @param options {object} options of geocoding acording google maps
        */
        /*
         * Poskytuje geokódování
         * @method geocode
         * @param address {object} adresa
         * @param options {object} vlastnosti geokódování podle google maps
        */
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
        
        /**
         * Provides geolocate of the visitor using the HTML5 Geolocation API.
         * @method geolocate
         * @param customFn {function} function which can perform code after geolocation, for example add marker
        */
        /*
         * Poskytuje geolokaci návštěvníka použitím HTML5 Geolocation API.
         * @method geolocate
         * @param customFn {function} funkce, která může vykonat kód po geolokaci, například přidat bod
        */
        geolocate: function(customFn) {
          if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              geolocCoords.coordLatitude = position.coords.latitude;
              geolocCoords.coordLongitude = position.coords.longitude;
              customFn();

              this.setCenter(pos);
            }, function() {
              handleNoGeolocation(true);
            });
          } else {
            // Browser doesn't support Geolocation
            handleNoGeolocation(false);
          }
          
          function handleNoGeolocation(errorFlag) {
                if (errorFlag) {
                  var content = 'Error: The Geolocation service failed.';
                } else {
                  var content = 'Error: Your browser doesn\'t support geolocation.';
                }

                var options = {
                  map: this,
                  position: new google.maps.LatLng(60, 105),
                  content: content
                };

                var infowindow = new google.maps.InfoWindow(options);
                this.setCenter(options.position);
          }
          
        },
        
  /***************************************************************************/
  /*                   GMAPY EVENTS  / UDÁLOSTI                              */
  /***************************************************************************/
        
        /**
         * Create listener
         * @method createListener
         * @param type {string} type of object (options: object, map, marker)
         * @param event {string} name of event
         * @param data {function} function performed after event triggering
        */
        /*
         * Vytvoří listener
         * @method createListener
         * @param type {string} typ objektu (options: object, map, marker)
         * @param event {string} název události
         * @param data {function} funkce, která se vykoná po spuštění události
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
         * Remove listener
         * @method removeListener
         * @param listener {object} listener designed for removing
        */
       /*
         * Vyjme listener
         * @method removeListener
         * @param listener {object} listener určený pro vyjmutí
        */
        removeListener: function(listener) {
            google.maps.event.removeListener(listener);
        },
        
  /***************************************************************************/
  /*                      GMAPY PLACE SERVICE                                */
  /***************************************************************************/      
        getPlaceDetails: function() {
              var request = {
                placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
              };
              var service = new google.maps.places.PlacesService(this);

                service.getDetails(request, function(place, status) {
                  if (status == google.maps.places.PlacesServiceStatus.OK) {
                    alert(place.name);

                  }
                });  
	},
        
  /***************************************************************************/
  /*                      GMAPY DRAWING MANAGER                              */
  /***************************************************************************/
        
        /**
         * Add Drawing Manager at map
         * @method addDrawingManager
         * @param controlPosition {string}  position of drawing manager on map (options: bottom-center, bottom-right,left-bottom, left-center, left-top, 
                   right-bottom, right-center, right-top, left-center, top-center, top-left, top-right)
         * @param defaultDrawMode {String} name of default layer type (options: marker, circle, polygon, polyline, rectangle)
         * @param showModes {Array} array of all layer types you can display at Drawing Manager
         * @param markerOpt {Object} marker options acording google maps
         * @param circleOpt {Object} circle options acording google maps
         * @param polygonOpt {Object} polygon options acording google maps
         * @param polylineOpt {Object} polyline options acording google maps
         * @param rectangleOpt {Object} rectangle options acording google maps
         */
        /*
         * Přidá drawing managera do mapy
         * @method addDrawingManager
         * @param controlPosition {string}  pozice drawing managera v mapě (možnosti: bottom-center, bottom-right,left-bottom, left-center, left-top, 
                   right-bottom, right-center, right-top, left-center, top-center, top-left, top-right)
         * @param defaultDrawMode {String} typ vrstvy, která bude nastavena jako defaultní (možnosti: marker, circle, polygon, polyline, rectangle)
         * @param showModes {Array} pole všech typů vrstev, které chcete zobrazit v Drawing Manageru
         * @param markerOpt {Object} vlastnosti markeru podle google maps
         * @param circleOpt {Object} vlastnosti kruhu podle google maps
         * @param polygonOpt {Object} vlastnosti polygonu podle google maps
         * @param polylineOpt {Object} vlastnosti křivky podle google maps
         * @param rectangleOpt {Object} vlastnosti obdélníku podle google maps
         */
        addDrawingManager: function(controlPosition, defaultDrawMode, showModes, markerOpt, circleOpt, polygonOpt, polylineOpt, rectangleOpt) {
            var defDrawMode;
            var cntrlPosition;
            
            
            switch(defaultDrawMode) {
                case 'marker': defDrawMode = google.maps.drawing.OverlayType.MARKER; break;
                case 'circle': defDrawMode = google.maps.drawing.OverlayType.CIRCLE; break;
                case 'polygon': defDrawMode = google.maps.drawing.OverlayType.POLYGON; break;
                case 'polyline' : defDrawMode = google.maps.drawing.OverlayType.POLYLINE; break;
                case 'rectangle' : defDrawMode = google.maps.drawing.OverlayType.RECTANGLE; break;
                default : null;
            }
            switch(controlPosition) {
                case 'bottom-center': cntrlPosition = google.maps.ControlPosition.BOTTOM_CENTER; break;
                case 'bottom-left': cntrlPosition = google.maps.ControlPosition.BOTTOM_LEFT; break;
                case 'bottom-right': cntrlPosition = google.maps.ControlPosition.BOTTOM_RIGHT; break;
                case 'left-bottom' : cntrlPosition = google.maps.ControlPosition.LEFT_BOTTOM; break;
                case 'left-center' : cntrlPosition = google.maps.ControlPosition.LEFT_CENTER; break;
                case 'left-top': cntrlPosition = google.maps.ControlPosition.LEFT_TOP; break;
                case 'right-bottom': cntrlPosition = google.maps.ControlPosition.RIGHT_BOTTOM; break;
                case 'right-center': cntrlPosition = google.maps.ControlPosition.RIGHT_CENTER; break;
                case 'right-top' : cntrlPosition = google.maps.ControlPosition.RIGHT_TOP; break;
                case 'left-center' : cntrlPosition = google.maps.ControlPosition.LEFT_CENTER; break;
                case 'top-center': cntrlPosition = google.maps.ControlPosition.TOP_CENTER; break;
                case 'top-left' : cntrlPosition = google.maps.ControlPosition.TOP_LEFT; break;
                case 'top-right' : cntrlPosition = google.maps.ControlPosition.TOP_RIGHT; break;
                default : cntrlPosition = google.maps.ControlPosition.TOP_CENTER;
            }
            drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: defDrawMode,
                drawingControl: true,
                drawingControlOptions: {
                    position: cntrlPosition,
                    drawingModes: showModes
                },
                markerOptions: markerOpt,
                circleOptions: circleOpt,
                polygonOptions: polygonOpt,
                polylineOptions: polylineOpt,
                rectangleOptions: rectangleOpt
                
            });
            google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
                all_overlays.push(e);
            });
            drawingManager.setMap(this.map); 
            
             //This event fires when creation of polygon is completed by user.
            google.maps.event.addDomListener(drawingManager, 'polygoncomplete', function(polygon) {
                //Call function to pass polygon as parameter to save its coordinated to an array.
                drawingManagerCoordinatesToArray(polygon);

                //This event is inside 'polygoncomplete' and fires when you edit the polygon by moving one of its anchors.
                google.maps.event.addListener(polygon.getPath(), 'set_at', function () {
                    
                    drawingManagerCoordinatesToArray(polygon);
                });

                //This event is inside 'polygoncomplete' too and fires when you edit the polygon by moving on one of its anchors.
                google.maps.event.addListener(polygon.getPath(), 'insert_at', function () {
                    drawingManagerCoordinatesToArray(polygon);
                });
            });
        },
        getDrawingManagerPolygonLatLng: function(indexOfPolygon){
            var polygonInArray = this.polygonsDrawingM[indexOfPolygon];
            var polygoncoord = polygonInArray.position.toUrlValue();
            return polygoncoord;
        },
        
        /**
         * Hide Drawing Manager
         * @method hideDrawingManager
         */
        /*
         * Skryje Drawing Manager
         * @method hideDrawingManager
         */
        hideDrawingManager: function() {
            drawingManager.setOptions({
                drawingControl: false
            });
        },
        
        /**
         * Show Drawing Manager
         * @method showDrawingManager
         */
        /*
         * Zobrazí Drawing Manager
         * @method showDrawingManager
         */
        showDrawingManager: function() {
            drawingManager.setOptions({
                drawingControl: true
            });
        },
        
        /**
         * Delete all Drawing Manager shapes from map
         * @method deleteDrawingManagerShape
         */
        /*
         * Smaže všechny tvary Drawing Manageru z mapy
         * @method deleteDrawingManagerShape
         */
        deleteDrawingManagerShape: function() {
           for (var i=0; i < all_overlays.length; i++){
                all_overlays[i].overlay.setMap(null);
            }
            all_overlays = [];    
        },
         
        
  /***************************************************************************/
  /*                   GMAPY STYLED MAPS  / STYLOVANÉ MAPY                   */
  /***************************************************************************/
        
        
        /**
         * Create styled map
         * @method styledMapType
         * @param id {string} id of styled map
         * @param options {Object} options of styled map
         * @param styles {Object} styles which will be dispayed on the map
        /*
         * Vytvoří stylyzovanou mapu
         * @method styledMapType
         * @param id {string} id stylované mapy
         * @param options {Object} vlastnosti stylovaných map
         * @param styles {Object} styly, které budou zobrazeny na mapě
         */
        styledMapType: function(id, options, styles) {
              var styledMap = new google.maps.StyledMapType(styles, options);
              this.mapTypes.set(id, styledMap);
              this.setMapTypeId(id);
        }
     
    } 
    
})(jQuery);
