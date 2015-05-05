(function($) {  
  /***************************************************************************/
  /*                           GMAPY GLOBALS / GLOBÁLNÍ PROMĚNNÉ             */
  /***************************************************************************/
    var directionInfo = {};
    var geolocCoords = {};
    var directionsDisplay;
    var directionsService;
    var chart;
    var travelingMod;
    var elevator = null;
    var elevations = null;
    var elevationsArray = null;
    var openedInfoWindow = null;
    var drawingManager;
    var polygonsDrawingM = [];
    var all_overlays = [];
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
            latitude: 49.817491999999990000,                // latitude souřadnice pro zobrazení mapy
            longitude: 15.472962000000052000,               // longitude souřadnice pro zobrazení mapy
            zoom: 7,                                        // přiblížení mapy
            delay: 200,                                     // zpoždení
            hideByClick: false,                             // zavření Info Window kliknutím na marker 
            prefixId: 'gmarker',                            
            polyId: 'gpoly',
            navigationControl: true,
            navigationControlOptions: {                     // defaultní nastavení pozice a stylu navigačního ovládání
                position: 'TOP_LEFT',
                style: 'DEFAULT'
            },
            mapTypeControl: true,
            mapTypeControlOptions: {                        // defaultní nastavení pozice a stylu ovládání typu mapy
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
            polyline: {                         // defaultní nastavení křivky
                color: '#FF0000',
                opacity: 1.0,
                weight: 2
            },
            polygon: {                          // defaultní nastavení polygonu
                color: '#FF0000',
                opacity: 1.0,
                weight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.2
            },
            circle: {                           // defaultní nastavení kruhu
                color: '#FF0000',
                opacity: 1.0,
                weight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.2
            },
            rectangle: {                        // defaultní nastavení obdélníku
                color: '#FF0000',   
                opacity: 1.0,
                weight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.2
            },
            maptype: 'SATELITE', 
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
        
        /*
         * Perform code of entered function after bounds of map changed.
         * @method ready
         * @param f {function}  function called after bounds of map changed
         * @returns {function}  return function performed code
         */
        /**
         * Vykoná kód vložené funkce, po změně hranic mapy.
         * @method ready
         * @param f {function}  funkce, která se vyvolá po změně hranic mapy
         * @returns {function}  vrátí funkcí vykonávaný kód
         */
        ready: function(f) {
            google.maps.event.addListenerOnce(this.map, 'bounds_changed', function() {  //přidá jednou listener, když se změní hranice
                return f();                                                             // vrátí funkci po události bounds_changed
            });
        },
           
        /*
         * Set the map options
         * @method setMap
         * @param options {object} set options of the map
        */
        /**
         * Nastaví mapu podle zadaných vlastností
         * @method setMap
         * @param options {object} nastaveni vlastností mapy
        */
        setMap: function(options) {
            delete options.mapTypeId;                                       // smaže původní mapTypeId
            if (options.address) {                                          // jestliže je ve vlastnostech mapy nastavena adresa, pak
                this.geocode({address: options.address, center: true});     // provede geokódování na zadanou adresu a vycentruje na ni
                delete options.address;                                     // smaže z vlastností mapy adresu pro další použití
            }
            else if (options.latitude && options.longitude) {               // jestliže jsou ve vlastnostech mapy nastaveny latitude a longitude souřadnice, pak
                options.center = new google.maps.LatLng(options.latitude, options.longitude);   // vycentruje mapu na zadané lat lng souřadnice
                delete options.longitude;                                   // smaže longitude souřadnici pro další použití
                delete options.latitude;                                    // smaže latitude souřadnici pro další použití
            }
            if (options.mapTypeControlOptions && options.mapTypeControlOptions.position)        // pokud je nastavena pozice v mapTypeControlOptions, pak
                options.mapTypeControlOptions.position = google.maps.ControlPosition[options.mapTypeControlOptions.position.toUpperCase()]; // převede název pozice na velká písmena, například google.maps.ControlPosition.BOTTOM_CENTER
            if (options.mapTypeControlOptions && options.mapTypeControlOptions.style)           // pokud je nastaven styl v mapTypeControlOptions, pak
                options.mapTypeControlOptions.style = google.maps.MapTypeControlStyle[options.mapTypeControlOptions.style.toUpperCase()]; // převede název stylu na velká písmena, například google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            if (options.navigationControlOptions && options.navigationControlOptions.position)  // pokud je nastavena pozice v navigationControlOptions, pak
                options.navigationControlOptions.position = google.maps.ControlPosition[options.navigationControlOptions.position.toUpperCase()]; // převede název pozice na velká písmena
            if (options.navigationControlOptions && options.navigationControlOptions.style)     // pokud je nastaven styl v navigationControlOptions
                options.navigationControlOptions.style = google.maps.NavigationControlStyle[options.navigationControlOptions.style.toUpperCase()];  // převede název stylu na velká písmena, například google.maps.NavigationControlStyle.SMALL
            this.map.setOptions(options);                                   // nastaví nové vlastnosti mapě
        },
        
        /*
         * Get the map
         * @method getMap
         * @returns {object}  return return map object
        */
        /**
         * Vrátí mapu
         * @method getMap
         * @returns {object}  return vrátí mapu jako objekt
        */
        getMap: function() {
            return this.map;                                                            // vrátí mapu
        },
        
  /***************************************************************************/
  /*                            GMAPY OVERLAYS                               */
  /***************************************************************************/
       
       /*
         * Allows to add a google maps Ground Overlay.
         * @method groundOverlay
         * @param url {string} URL of the picture to display on the map
         * @param bounds {object} LatLngBounds specified coordinates
         * @param groundOpt {object} ground overlay options acording Google Maps documentation
        */
       /**
         * Dovoluje přidat google maps Ground Overlay.
         * @method groundOverlay
         * @param url {string} URL obrázku, který bude zobrazen na mapě
         * @param bounds {object} souřadnice zadané jako LatLngBounds
         * @param groundOpt {object} volby ground overlay podle dokumentace Google Maps
        */ 
        groundOverlay: function(url, bounds, groundOpt) {
            var groundoverlay;                                                      // vytvoří proměnnou groundoverlay
            groundoverlay = new google.maps.GroundOverlay(url, bounds, groundOpt);  // přiřadí do proměnné groundoverlay vytvořený novou instanci třídy GroundOverlay, které je předáno url, hranice a vlastnosti vrstvy
            groundoverlay.setMap(this.map);                                         // nastaví vrstvu na mapu
        },
        
        /*
         * Show or hide marker on the map.
         * @method showHideMarker
         * @param marker {object}  marker, which will be displayed or hidden 
         * @param display {boolean}  true - show marker, false - hide marker
         */
        /**
         * Zobrazí nebo skryje marker na mapě.
         * @method showHideMarker
         * @param marker {object}  marker, který bude zobrazen nebo skryt
         * @param display {boolean} true - zobrazí marker, false - skryje marker
         */
        showHideMarker: function(marker, display) {
            if (typeof display === 'undefined') {                       // podmínka - zda proměnná display nebyla deklarována, pak
                if (this.getVisibleMarker(marker)) {                    // podmínka - jestliže je na mapě povolena viditelnost markeru, pak
                    $(this.mapId).data(marker).setVisible(false);       // viditelnost marker je nastavena na false
                    var info = $(this.mapId).data(marker);              // uloží marker do proměnné info
                    if (info && info.show) {                            // podmínka - pokud jsou marker a zároveň jeho vlastnost show povoleny, pak
                        info.close();                                   // ukončí info
                        info.show = false;                              // vlastnost show nastaví na false
                    }                               
                }
                else                                                    
                    $(this.mapId).data(marker).setVisible(true);         // jinak nastaví viditelnost na true
            }
            else
                $(this.mapId).data(marker).setVisible(display);         // jinak nastaví viditelnost podle zadané proměnné display
        },
        
        /*
         * Function which returns count of markers on the map
         * @method getMarkerCount
         * @return {int} return marker count on the map
         */
        /**
         * Funkce, která vrací počet markerů na mapě
         * @method getMarkerCount
         * @return {int} vrátí počet markerů v mapě
         */
        getMarkerCount: function() {
            return this.markers.length;                                         // vrátí velikost pole markers            
        },

        /*
         * Create marker on the map
         * @method createMarker
         * @param marker {object}  options of the marker, accepts any option defined in google.maps.MarkerOptions
         * @returns cmarker {google.maps.Marker}  return marker
         */
        /**
         * Vytvoří marker na mapě
         * @method createMarker
         * @param marker {object}  vlastnosti nastavené markeru, akceptuje nastavení definovaná v google.maps.MarkerOptions
         * @returns cmarker {google.maps.Marker}  vrátí marker
         */
        createMarker: function(marker) {
            if (!marker.geocode) {                                              // podmínka - pokud není nalezena zeměpisná pozice markeru, pak 
                this.count++;                                                   // zvyší count o jedna
                if (!marker.id)                                                 // podmínka - pokud není zadáno id markeru, pak
                    marker.id = this.opts.prefixId + this.count;                // id markeru nastaví na prefixId + count, konec podmínky
            }                                                                   // konec podmínky
            if (marker.address && !marker.geocode) {                            // podmínka - pokud je adresa markeru a není nalezena zeměpisná pozice markeru, pak
                this.geoMarkers.push(marker);                                   // vloží marker do pole geoMarkers
                this.geoMarker();                                               // zavolá funkci geoMarker()
            }                                                                   // konec podmínky
            else if (marker.latitude && marker.longitude || marker.position) {  // podmínka - pokud jsou určeny souřadnice latitude a longitude nebo pozice, pak
                var options = {map: this.map};                                  // v objektu options je nastaveno map na současnou mapu
                options.id = marker.id;                                         // id objektu options je nastaveno na id markeru
                if (marker.visible === false)                                   // podmínka - pokud je viditelnost markeru nastavena na false, pak
                    options.visible = marker.visible;                           // nastaví vlastnost visible objektu options na vlastnost visible objektu marker, konec podmínky
                if (marker.title)                                               // podmínka - pokud je vlastnost title objektu marker, pak
                    options.title = marker.title;                               // uloží vlastnot title objektu marker do vlastnoti title objektu options, konec podmínky
                if (marker.draggable)                                           // podmínka - pokud je vlastnost draggable objektu marker, pak
                    options.draggable = marker.draggable;                       // uloží vlastnot draggable objektu marker do vlastnosti draggable objektu options
                if (marker.icon && marker.icon.image) {                         // podmínka - pokud je podobjekt icon a zároveň její vlastnost image, pak
                    options.icon = marker.icon.image;                           // vlastnosti icon objektu options nastaví vlastnost image 
                    if (marker.icon.shadow)                                     // podmínka - pokud je vlastnost shadow podobjektu icon objektu marker, pak
                        options.shadow = marker.icon.shadow;                    // nastaví vlastnositi shadow vlastnost shadow podobjektu icon objektu marker
                }
                else if (marker.icon)                                           // jinak jestliže je vlastnost icon objektu marker, pak
                    options.icon = marker.icon;                                 // nastaví vlastnost icon objektu marker vlastnosti icon objektu options
                else if (this.opts.icon && this.opts.icon.image) {              // jinak jestliže je podobjekt icon a zároveň jeho vlastnost image v objektu opts, pak
                    options.icon = this.opts.icon.image;                        // nastaví obrázek ikonky
                    if (this.opts.icon.shadow)                                  // pokud je požadován stín u ikonky, pak
                        options.shadow = this.opts.icon.shadow;                 // nastaví stín ikonce
                }
                else if (this.opts.icon)                                        // jinak jestliže je pouze defaulně nastavena ikonka, pak
                    options.icon = this.opts.icon;                              // nastaví daultní ikonku 
                options.position = marker.position ? marker.position : new google.maps.LatLng(marker.latitude, marker.longitude);   // nastaví pozici na latitude a longitude souřadnice
                var cmarker = new google.maps.Marker(options);                  // vytvoří marker se zadanými vlastnostmi
                if (marker.html) {                                              // pokud je nastaven podobjekt html, pak
                    if (!marker.html.content && !marker.html.ajax && !marker.html.id)   // pokud není nastaven v objektu html obsah, ajax a id markeru, pak
                        marker.html = {content: marker.html};                   // jako content (obsah) se v marker.html nastaví vlastnosti podobjektu html
                    else if (!marker.html.content)                              // jinak pokud není nastaven pouze content (obsah), pak
                        marker.html.content = null;                             // nastaví content na prázdny
                    this.setInfoWindow(cmarker, marker.html);                   // nastaví InfoWindow podle vytvořeného markeru
                }
                this.addMarker(cmarker);                                        // zavolá funkci addMarker a předá ji marker, který pak uloží do pole
                return cmarker;                                                 // vrátí vytvořený marker
            }
        },
        
        /*
         * Add marker to the array of maarkers
         * @method addMarker
         * @param marker {object}  added marker to array of markers
         */
        /**
         * Přidá marker do pole markerů
         * @method addMarker
         * @param marker {object}  marker přidaný do pole markerů
         */
        addMarker: function(marker) {
            $(this.mapId).data(marker.id, marker);                                  // uloží marker
            this.markers.push(marker.id);                                           // vloží id markeru do pole markers
        },
        
        /*
         * Set chosen marker options
         * @method setMarker
         * @param marker {object}  edited marker
         * @param options {object}  new marker options
         */
        /**
         * Nastaví vybranému markeru vlastnosti
         * @method setMarker
         * @param marker {object}  marker, který bude upravován
         * @param options {object}  nové vlastnosti nastavené markeru
         */
        setMarker: function(marker, options) {
            var tmarker = $(this.mapId).data(marker);                   // uloží marker
            delete options.id;                                          // smaže id ve vlastnostech 
            delete options.visible;                                     // smaže viditelnost ve vlastnostech
            if (options.icon) {                                         // jestliže je nastavena ikonka markeru, pak
                var toption = options.icon;                             // uloží ikonku do proměnné
                delete options.icon;                                    // smaže původní ikonu
                if (toption && toption === 'default') {                 // pokud jsou je defaultní nastavení, pak nastaví defaultní obrázek popřípadě pokud je uvedena možnost shadow, přidá i stín ikonce
                    if (this.opts.icon && this.opts.icon.image) {       
                        options.icon = this.opts.icon.image;            
                        if (this.opts.icon.shadow)                    
                            options.shadow = this.opts.icon.shadow;     
                    }   
                    else if (this.opts.icon)                          
                        options.icon = this.opts.icon;
                }
                else if (toption && toption.image) {                    // pokud je zadán vlastní obrázek, nastaví ikonce vlastní obrázek, popřípadě nastaví i stín pokud je požadováno
                    options.icon = toption.image;
                    if (toption.shadow)
                        options.shadow = toption.shadow;
                }
                else if (toption)                                       
                    options.icon = toption;
            }
            if (options.address) {                         // pokud je nastavena adresa, pak             
                this.geocode({address: options.address}, {markerId: tmarker});  // provede geokódování na zadanou adresu pro konkrétní marker
                delete options.address;                    // smaže adresu
                delete options.latitude;                   // smaže latitude souřadnici 
                delete options.longitude;                  // smaže longitude souřadnici 
                delete options.position;                   // smaže pozici 
            }
            else if (options.latitude && options.longitude || options.position) {   // pokud jsou zadány lat lon souřadnice nebo pozice, pak
                if (!options.position)                     // pokud není zadána pozice, pak 
                    options.position = new google.maps.LatLng(options.latitude, options.longitude); // dosadí zadané latitude longitude souřadnice do pozice
            }
            tmarker.setOptions(options);                   // nastaví markeru zavedené vlastnosti 
        },
        
        /*
         * Remove marker from map and array of markers
         * @method removeMarker
         * @param marker {object} marker which will be removed
        */
        /**
         * Vyjme marker z mapy a pole markerů
         * @method removeMarker
         * @param marker {object} marker, který bude vyjmut
        */
        removeMarker: function(marker) {
            var index = $.inArray(marker, this.markers), actual;         // uloží do proměnné index marker, který získá z pole podle zadaného markeru   
            if (index >= -1) {                                           // pokud je hodnota v poli nalezena, pak
                actual = this.markers.splice(index, 1);                  // nalezená hodnota z pole je vymazána
                var markerId = actual[0];                                // uloží do proměnné markerId hodnotu z nulté pozice v poli
                var marker = $(this.mapId).data(markerId);               // získá markerId a uloží do proměnné marker
                var info = $(this.mapId).data(markerId + 'info');        // získá markerId + info a uloží do proměnné info
                marker.setVisible(false);                                // mastaví viditelnost markeru na false   
                marker.setMap(null);                                     // nastaví marker na mapě na null   
                $(this.mapId).removeData(markerId);                      // smaže marker podle markerId
                if (info) {                                              // pokud je info window nastaveno, tak se zavře a vlastnost show(zobrazení) je nastavena na false
                    info.close();
                    info.show = false;
                    $(this.mapId).removeData(markerId + 'info');         // smaže se markerId+info
                }
                return true;                                             // pokud je hodnota v poli nalezena, vrátí true
            }   
            return false;                                               // pokud není hodnota v poli nalezena, vrátí false
        },
        
        /*
         * Clear all markers from map and array of markers
         * @method clearMarkers
        */
        /**
         * Vymaže všechny markery z mapy a pole markerů
         * @method clearMarkers
        */
        clearMarkers: function() {
            for (var i = 0, l = this.markers.length; i < l; i++) {      // projede pole markerů   
                var markerId = this.markers[i];                         // uloží do proměnné markerId konkrétní marker z pole       
                var marker = $(this.mapId).data(markerId);              // do proměnné marker uloží id markeru 
                var info = $(this.mapId).data(markerId + 'info');       // do proměnné info uloží id markeru + info
                marker.setVisible(false);                               // nastaví viditelnost markeru na false 
                marker.setMap(null);                                    // nastaví marker na mapě na null
                $(this.mapId).removeData(markerId + 'info');            // vymaže markerId+info
                if (info) {                                             // pokud je info window nastaveno, tak se zavře a vlastnost show(zobrazení) je nastavena na false
                    info.close();
                    info.show = false;
                    $(this.mapId).removeData(markerId);                 // smaže se markerId
                }
            }
            this.singleMarker = false;                                  
            this.lockGeocode = false;                                   // znemožní se geokódování
            this.markers = [];                                          // vymaže se pole markerů
            this.geoMarkers = [];                                       // vymaže se pole geomarkerů
        },
        
        /*
         * Perform geocode of marker address at zero position in the array
         * @method geoMarker
        */
        /**
         * Provede geokódování na adresu markeru na nulté pozici v poli
         * @method geoMarker
        */
        geoMarker: function() {
            if (this.geoMarkers.length > 0 && !this.lockGeocode) {          // pokud je velikost pole geomarkerů větší než nula a není zamknuto geokódování
                this.lockGeocode = true;                                    // nastaví lockGeocode na true
                var current = this.geoMarkers.splice(0, 1);                 // uloží do proměnné current marker na nulté pozici, který je smazán z pole
                this.geocode({address: current[0].address}, current[0]);    // provede geokódování na adresu markeru na nulté pozici v poli
            }
            else if (this.lockGeocode) {                                    // jestliže je povolen lockGeocode (uzamčené geokódování)
                var Gmapy = this;                                       
                setTimeout(function() {                                     // spustí se funkce, která opět spustí funkci geoMarker po určitém zpoždění
                    Gmapy.geoMarker();
                }, this.opts.delay);
            }
        },
        
        /*
         * Set Info Window of marker and add it to array
         * @method setInfoWindow
         * @param tmarker {object} marker which info window will be set up
         * @param html {object} options of info window
         * @param index {int} info window array index
        */
        /**
         * Nastaví Info Window markeru a přidá jej do pole
         * @method setInfoWindow
         * @param tmarker {object} marker, jehož info window bude nastaveno
         * @param html {object} vlastnosti info window
         * @param index {int} index info window v poli.
        */
        setInfoWindow: function(tmarker, html, index) {
            var Gmapy = this;
            var marker = $(this.mapId).data(tmarker);                         // uloží tmarker do proměnné marker  
            html.content = html.content;                                      // uloží content(obsah) objektu html  
            var infowindow = new google.maps.InfoWindow(html);                // vytvoří InfoWindow se zadanými vlastnostmi (html)
            this.infoWindowsArray.splice(index, 1);                           // vyhodí InfoWindow na zadaném indexu
            this.infoWindowsArray.push(infowindow);                           // přidá do pole infowindow  
            infowindow.show = false;                                          // vlastnost show (zobrazení InfoWindow) je nastavena na false  
            $(Gmapy.mapId).data(marker.id + 'info', infowindow);              // uloží k danému id vytvořené InfoWindow
            if (html.popup) {                                                 // jestliže je povoleno v objektu html popup okno, pak
                Gmapy.openWindow(infowindow, marker, html);                   // zavolá funkci openWindow, která okno otevře
                infowindow.show = true;                                       // infowindow show se nastaví na true po zavolání funkce
            }
            google.maps.event.addListener(marker, 'click', function() {       // vytvoří listener, který po kliknutí na marker spustí funkci
                if (openedInfoWindow != null) openedInfoWindow.close();       // jestliže je povolné openedInfoWindow, pak jej zavře  
                infowindow.open(this.map, marker);                            // otevře info window na mapě pro konkrétní marker
                openedInfoWindow = infowindow;                                // nastaví info window v openedInfoWindow
                google.maps.event.addListener(infowindow, 'closeclick', function() {    // událost při kliknutí na křížek u info window bubliny
                    openedInfoWindow = null;                                  // openedInfoWindow se nastaví na null
                });
            });
             
        },
        
        /*
         * Set Info Window of marker and add it to array
         * @method openWindow
         * @param infowindow {object} created InfoWindow
         * @param marker {object} options of marker
         * @param html {object} options of info window
        */
        /**
         * Otevře Info Window vybraného markeru
         * @method openWindow
         * @param infowindow {object} vytvořené InfoWindow
         * @param marker {object} vlastnosti markeru
         * @param html {object} vlastnosti info window
        */
        openWindow: function(infowindow, marker, html) {
            if (this.opts.oneInfoWindow)                    // jestliže je nastaveno oneInfoWindow (jedno InfoWindow na mapě)
                this.clearInfo();                           // vymažou se všechna InfoWindow na mapě
            if (html.ajax) {                                // pokud je povolen ajax
                infowindow.open(this.map, marker);          // otevře se InfoWindow nad konkrétním markerem
                $.ajax({                                    // pomocí ajaxu se nastaví obsah InfoWindow
                    url: html.ajax,
                    success: function(html) {
                        infowindow.setContent(html);
                    }
                });
            }
            else if (html.id) {                             // jinak pokud je nastaveno id v objektu html, pak
                infowindow.setContent($(html.id).html());   // nastaví obsah info window
                infowindow.open(this.map, marker);          // otevře info window na mapě pro konkrétní marker
            }
            else                                            // jinak otevře info window pro marker bez nastavení jeho obsahu
                infowindow.open(this.map, marker);
        },
        
        /*
         * Get content of info window stored in array of info windows
         * @method getInfo
         * @param indexOfInfoWindow {int} index of info window in array
         * @returns infocontent {string}  return content of info window as a text
        */
        /**
         * Získá obsah info window uloženého v poli info windows
         * @method getInfo
         * @param indexOfInfoWindow {int} index info window v poli
         * @returns infocontent {string}  vrátí obsah info window v textové podobě
        */
        getInfo: function(indexOfInfoWindow) {
            var infocontent = this.infoWindowsArray[indexOfInfoWindow].getContent();    // získá obsah info window uloženého v poli info windows podle určitého indexu
            return infocontent;                                                         // vrátí obsah info window v textové podobě
                
	},
        
        /*
         * Close all Info Windows
         * @method closeInfo
        */
        /**
         * Zavře všechna Info Window
         * @method closeInfo
        */
        closeInfo: function() {
             for (var i = 0, l = this.markers.length; i < l; i++) {                 // projede v cyklu pole markerů
		var info = $(this.mapId).data(this.markers[i] + 'info');            // uloží do proměnné info konkrétní marker
		if(info) {                                                          // jestliže je info, pak
			info.close();                                               // zavře info
			info.show = false;                                          // nastaví vlastnosti show objektu info false
		}
             }
	},
        
        /*
         * Create polyline with set options
         * @method createPolyline
         * @param poly {object} set options of polyline
         * @returns {object}  return polyline displayed on the map
        */
        /**
         * Vytvoří křivku se zadanými vlastnostmi
         * @method createPolyline
         * @param poly {object} zadané vlastnosti křivky
         * @returns {object}  vrátí křivku zobrazenou na mapě
        */
        createPolyline: function(poly) {                                            
            poly.type = 'polyline';                                             // vlastnosti type objektu poly nastaví hodnotu polyline
            return this.createOverlay(poly);                                    // vrátí vytvořený overlay, kterému je předán objekt poly
        },
        
        /*
         * Create polygon with set options
         * @method createPolygon
         * @param poly {object} set options of polygon
         * @returns {object}  return polygon displayed on the map
        */
        /**
         * Vytvoří polygon se zadanými vlastnostmi
         * @method createPolygon
         * @param poly {object} zadané vlastnosti polygonu
         * @returns {object}  vrátí polygon zobrazený na mapě
        */
        createPolygon: function(poly) {
            poly.type = 'polygon';                                              // vlastnosti type objektu poly nastaví hodnotu polygon
            return this.createOverlay(poly);                                    // vrátí vytvořený overlay, kterému je předán objekt poly
        },
        
        /*
         * Create circle with set options
         * @method createCircle
         * @param poly {object} set options of circle
         * @returns {object}  return circle displayed on the map
        */
        /**
         * Vytvoří kruh se zadanými vlastnostmi
         * @method createCircle
         * @param poly {object} zadané vlastnosti kruhu
         * @returns {object}  vrátí kruh zobrazený na mapě
        */
        createCircle: function(poly) {
            poly.type = 'circle';                                               // vlastnosti type objektu poly nastaví hodnotu circle
            return this.createOverlay(poly);                                    // vrátí vytvořený overlay, kterému je předán objekt poly
        },
        
        /*
         * Create rectangle with set options
         * @method createRectangle
         * @param poly {object} set options of rectangle
         * @returns {object}  return rectangle displayed on the map
        */
        /**
         * Vytvoří obdélník se zadanými vlastnostmi
         * @method createRectangle
         * @param poly {object} zadané vlastnosti obdélníku
         * @returns {object}  vrátí obdélník zobrazený na mapě
        */
        createRectangle: function(poly) {
            poly.type = 'rectangle';                                            // vlastnosti type objektu poly nastaví hodnotu rectangle
            return this.createOverlay(poly);                                    // vrátí vytvořený overlay, kterému je předán objekt poly
        },
        
        /*
         * Create shape (polyline, polygon, circle, rectangle)
         * @method createOverlay
         * @param poly {object} set options of shape
         * @returns overlay {object}  return shape displayed on the map
        */
        /**
         * Vytvoří tvar (křivka, polygon, kruh, obdélník)
         * @method createOverlay
         * @param poly {object} zadané vlastnosti tvaru
         * @returns overlay {object}  vrátí tvar zobrazený na mapě
        */
        createOverlay: function(poly) {
            var overlay = [];                                                                 // vytvoří pole overlay
            if (!poly.id) {                                                                   // pokud není v objektu poly definováno id tvaru          
                this.count++;                                                                 // zvětší count o jedna
                poly.id = this.opts.polyId + this.count;                                      // nastaví id objektu poly na polyId + count
            }
            switch (poly.type) {                                                              // vybere možnost podle zadaného typu
                case 'polyline':                                                              // pokud je typ nastaven na polyline, tak  
                    if (poly.coords.length > 0) {                                             // pokud je velikost pole souřadnic křivky větší než nula, pak  
                        for (var j = 0, l = poly.coords.length; j < l; j++)                   // v cyklu projde pole souřadnic  
                            overlay.push(new google.maps.LatLng(poly.coords[j].latitude, poly.coords[j].longitude));    // naplní pole overlay souřadnicemi latitude a longitude podle pole coords
                        overlay = new google.maps.Polyline({                                    //  do overlay se uloží vytvořená křivka, kde se zadají vlastnosti křivky podle Google Maps API
                            map: this.map,                                                      //  na jakou mapu bude křivka zobrazena        
                            path: overlay,                                                      //  jaká cesta se bude zobrazovat
                            strokeColor: poly.color ? poly.color : this.opts.polyline.color,     // jakou barvu bude mít křivka   
                            strokeOpacity: poly.opacity ? poly.opacity : this.opts.polyline.opacity,    // jakou průhlednost bude mít křivka
                            strokeWeight: poly.weight ? poly.weight : this.opts.polyline.weight         // jakou tloušťku bude mít křivka    
                        });
                    }
                    else
                        return false;                                                               // nejsou-li definovány souřadnice, vrátí false
                    break;
                case 'polygon':                                                                     // pokud je typ nastaven na polygon, tak  
                    if (poly.coords.length > 0) {                                                   // pokud je velikost pole souřadnic polygonu větší než nula, pak
                        for (var j = 0, l = poly.coords.length; j < l; j++)                         // v cyklu projde pole souřadnic
                            overlay.push(new google.maps.LatLng(poly.coords[j].latitude, poly.coords[j].longitude));  // naplní pole overlay souřadnicemi latitude a longitude podle pole coords
                        overlay = new google.maps.Polygon({                                         //  do overlay se uloží vytvořený polygon, kde se zadají vlastnosti polygonu podle Google Maps API
                            map: this.map,                                                          //  na jakou mapu bude polygon zobrazen
                            path: overlay,                                                          //  jaká cesta se bude zobrazovat
                            strokeColor: poly.color ? poly.color : this.opts.polygon.color,         // jakou barvu bude mít obtah polygonu
                            strokeOpacity: poly.opacity ? poly.opacity : this.opts.polygon.opacity, // jakou průhlednost bude mít obtah polygonu
                            strokeWeight: poly.weight ? poly.weight : this.opts.polygon.weight,      // jakou tloušťku bude mít obtah polygonu
                            fillColor: poly.fillColor ? poly.fillColor : this.opts.polygon.fillColor,          // jakou barvu bude mít výplň polygonu 
                            fillOpacity: poly.fillOpacity ? poly.fillOpacity : this.opts.polygon.fillOpacity    // jakou průhlednost bude mít výplň polygonu
                        });
                    }
                    else
                        return false;
                    break;
                case 'circle':                                                                    // pokud je typ nastaven na kruh, tak
                    overlay = new google.maps.Circle({                                            // do overlay se uloží vytvořený kruh, kde se zadají vlastnosti polygonu podle Google Maps API  
                        map: this.map,                                                              // na které mapě bude kruh zobrazen
                        center: new google.maps.LatLng(poly.latitude, poly.longitude),              // vycentrování mapy na kruh
                        radius: poly.radius,                                                        // nastavení radiusu kruhu
                        strokeColor: poly.color ? poly.color : this.opts.circle.color,              // barva obtahu kruhu
                        strokeOpacity: poly.opacity ? poly.opacity : this.opts.circle.opacity,      // průhlednost obtahu kruhu
                        strokeWeight: poly.weight ? poly.weight : this.opts.circle.weight,          // tloušťka obtahu kruhu
                        fillColor: poly.fillColor ? poly.fillColor : this.opts.circle.fillColor,    // barva výplně kruhu
                        fillOpacity: poly.fillOpacity ? poly.fillOpacity : this.opts.circle.fillOpacity     // průhlednost výplně kruhu
                    });
                    break;
                case 'rectangle':                                                       // pokud je typ nastaven na kruh, tak
                    overlay = new google.maps.Rectangle({                               // do overlay se uloží vytvořený obdélník, kde se zadají vlastnosti polygonu podle Google Maps API
                        map: this.map,                                                  // na které mapě bude obdélník zobrazen    
                        bounds: new google.maps.LatLngBounds(new google.maps.LatLng(poly.sw.latitude, poly.sw.longitude), new google.maps.LatLng(poly.ne.latitude, poly.ne.longitude)), // souřadnice hranic obdélníku (sw - south west, ne - nort east)
                        strokeColor: poly.color ? poly.color : this.opts.circle.color,              // barva obtahu obdélníku
                        strokeOpacity: poly.opacity ? poly.opacity : this.opts.circle.opacity,      // průhlednost obtahu obdélníku
                        strokeWeight: poly.weight ? poly.weight : this.opts.circle.weight,          // tloušťka obtahu obdélníku
                        fillColor: poly.fillColor ? poly.fillColor : this.opts.circle.fillColor,    // barva výplně obdélníku
                        fillOpacity: poly.fillOpacity ? poly.fillOpacity : this.opts.circle.fillOpacity   // průhlednost výplně obdélníku
                    });
                    break;
                default:
                    return false;
                    break;
            }
            this.addOverlay(poly, overlay);                         // přidá vrstvu na mapu
            return overlay;                                         // vrátí vrstvu
        },
        
        /*
         * Add shape to array
         * @method addOverlay
         * @param poly {object} set options of shape
         * @param overlay {object} shape which will be added to array (polyline, polygon, circle, rectangle)
        */
        /**
         * Přidá tvar do pole
         * @method addOverlay
         * @param poly {object} zadané vlastnosti tvaru
         * @param overlay {object} tvar, který bude přidán do pole (křivka, polygon, kruh, obdélník)
        */
        addOverlay: function(poly, overlay) {
            $(this[this.overlays[poly.type].id]).data(poly.id, overlay);                       
            this[this.overlays[poly.type].array].push(poly.id);                             
        },
        
        /*
         * Set new options of existing shape
         * @method setOverlay
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
         * @param overlay {string} name of shape (id)
         * @param options {object} new options of shape
        */
        /**
         * Nastaví existujícímu tvaru nové vlastnosti
         * @method setOverlay
         * @param type {string} název tvaru (možnosti: polyline, polygon, circle nebo rectangle)
         * @param overlay {string} název tvaru (id)
         * @param options {object} nové vlastnosti nastavené tvaru
        */
        setOverlay: function(type, overlay, options) {
            overlay = $(this[this.overlays[type].id]).data(overlay);                // uloží overlay podle id daného typu
            if (options.coords && options.coords.length > 0) {                      // pokud je pole souřadnic coords a zároveň je jeho délka větší než nula, pak 
                var array = [];                                                     // vytvoří pole array
                for (var j = 0, l = options.coords.length; j < l; j++)              // v cyklu projede pole souřadnic coords
                    array.push(new google.maps.LatLng(options.coords[j].latitude, options.coords[j].longitude));    // naplní pole array latitude, longitude souřadnicemi podle konkrétní hodnoty v poli coords
                options.path = array;                                               // nastavení cesty pro vykreslení na pole array
                delete options.coords;                                              // smazání vlastnosti coords v objektu options
            }
            else if (options.ne && options.sw) {                                    // jinak jestliže jsou zadány ve vlastnostech souřadnice pro north-east (ne) a south-west (sw), pak
                options.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(options.sw.latitude, options.sw.longitude), new google.maps.LatLng(options.ne.latitude, options.ne.longitude)); // nastaví se do vlastnosti bounds objektu options souřadnice ne a sw
                delete options.ne;                                                  // smazání vlastnosti ne
                delete options.sw;                                                  // smazání vlastnosti sw
            }
            else if (options.latitude && options.longitude) {                       // jinak jestliže jsou zadány souřadnice latitude a zároveň longitude, pak
                options.center = new google.maps.LatLng(options.latitude, options.longitude); // nastaví vycentrování na souřadnice latitude a longitude
                delete options.latitude;                                            // vymaže latitude vlastnost
                delete options.longitude;                                           // vymaže longitude vlastnost
            }
            overlay.setOptions(options);                                            // nastaví vlastnosti vrstvě overlay
        },
        
        /*
         * Remove shape from map and array
         * @method removeOverlay
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
         * @param overlay {string} name of shape (id)
        */
        /**
         * Vyjme tvar z mapy a pole 
         * @method removeOverlay
         * @param type {string} název tvaru (možnosti: polyline, polygon, circle nebo rectangle)
         * @param overlay {string} název tvaru (id)
        */
        removeOverlay: function(type, overlay) {
            var index = $.inArray(overlay, this[this.overlays[type].array]), current;     // uloží do proměnné index index tvaru, který získá z pole podle zadaného overlay id
            if (index > -1) {                                                             // pokud je hodnota v poli nalezena, pak 
                current = this[this.overlays[type].array].splice(index, 1);               // nalezená hodnota z pole je vymazána 
                var markerId = current[0];                                                // uloží do proměnné markerId hodnotu z nulté pozice v poli  
                $(this[this.overlays[type].id]).data(markerId).setMap(null);              // nastaví daný typ vrstvy na mapě na null  
                $(this[this.overlays[type].id]).removeData(markerId);                     // vymaže tvar  
                return true;
            }
            return false;
        },
        
        /*
         * Clear all shapes acording type from map and array
         * @method clearOverlays
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
        */
        /**
         * Vymaže tvary podle typu z mapy a pole 
         * @method clearOverlays
         * @param type {string} název tvaru (možnosti: polyline, polygon, circle nebo rectangle)
        */
        clearOverlays: function(type) {
            for (var i = 0, l = this[this.overlays[type].array].length; i < l; i++) {   // projede pole určitého typu kreslící vrstvy
                var markerId = this[this.overlays[type].array][i];                      // postupně načítá všechny prvky z pole
                $(this[this.overlays[type].id]).data(markerId).setMap(null);            // nastavuje u prvků viditelnost na mapě na null
                $(this[this.overlays[type].id]).removeData(markerId);                   // vymaže vrstvu
            }
            this[this.overlays[type].array] = [];                                       // vymaže celé pole
        },
        
  /***************************************************************************/
  /*                            GMAPY LAYERS / VRSTVY                        */
  /***************************************************************************/
  
        /*
         * Add classic layer to map (traffic, transit nebo bicycling)
         * @method addLayer
         * @param type {string} name of shape (options: polyline, polygon, circle or rectangle)
        */
        /**
         * Přidá klasickou vrstvu do mapy (traffic, transit nebo bicycling) 
         * @method addLayer
         * @param layerName {string} název vrstvy (možnosti: traffic, transit, bicycling)
        */
        addLayer: function(layerName){
            var layer;                                                          // vytvoří proměnnou layer
          switch(layerName) {                                                   // vybere na základě jména vrstvy    
                case 'traffic': layer = new google.maps.TrafficLayer();         // pokud je jméno vrstvy traffic, nastaví layer na Google Maps vrstvu TrafficLayer (silniční vrstva)
                break;
                case 'transit': layer = new google.maps.TransitLayer();         // pokud je jméno vrstvy transit, nastaví layer na Google Maps vrstvu TransitLayer (veřejná doprava)
                break;
                case 'bicycling': layer = new google.maps.BicyclingLayer();     // pokud je jméno vrstvy bicycling, nastaví layer na Google Maps vrstvu BicyclingLayer (cyklostezky)
                break; 
          }
          layer.setMap(this.map);                                               // nastaví vrstvu na mapu

        },
        
        /*
         * Get data from fusion tables
         * @method getFromFusionTables
         * @param options {object} options for fusion tables layer acording google maps
        */
        /**
         * Získá data z fusion tables 
         * @method getFromFusionTables
         * @param options {object} vlastnosti pro fusion tables vrstvu podle google maps
        */
        getFromFusionTables: function(options) {         
             var layer = new google.maps.FusionTablesLayer(options);            // vytvoří proměnné layer FusionTable vrstvu podle Google Maps a předá jí vlastnosti
             layer.setMap(this.map);                                            // nastaví vrstvu na mapu
	},
         
        /*
         * Display KML on map from URL address
         * @method kmlLayer
         * @param kmladress {String} URL adresa kml souboru
        */
        /**
         * Zobrazí KML na mapě ze zvolené URL adresy
         * @method kmlLayer
         * @param kmladress {String} URL adresa KML souboru
        */
        kmlLayer: function(kmladdress) {
            var kmlLayer = new google.maps.KmlLayer({                           // do proměnné kmlLayer vytvoří Kml vrstvu podle Google Maps
                url: kmladdress,                                                 // url přejde na adresu, na které je uložen KML soubor
                map: this.map                                                   // nastaví KML vrstvu na mapu
            });
        },
        
        /*
         * Parse KML file and show result on map
         * @method parseKML
         * @param kmlfile {String} the name of KML file
        */
        /**
         * Parsuje KML soubor a zobrazí výsledek na mapě
         * @method parseKML
         * @param kmlfile {String} název KML souboru
        */
        parseKML: function(kmlfile) {
            var geoXml = new geoXML3.parser({map: this.map, singleInfoWindow: true});          // vytvoří XML parser 
            geoXml.parse(kmlfile);                                                             // rozparsuje daný soubor 
            this.markers.push(geoXml.docs[0].placemarks[0].marker);                            // uloží marker do pole markers 
        },
        
        /*
         * Create heat map layer on the map from entered data
         * @method heatmapLayer
         * @param data {array} array of latitude longitude coordinates
         * @param heatGradient {array} array of rgba colors
         * @param heatRadius {int} the radius of influence for each data point
         * @param heatOpacity {float} the opacity of the heatmap between 0 and 1
        */
        /**
         * Vytvoří heat map vrstvu na mapě ze zadaných dat
         * @method heatmapLayer
         * @param data {array} pole latitude longitude souřadnic
         * @param heatGradient {array} pole rgba barev
         * @param heatRadius {int} radius ovlivnění pro každý datový bod
         * @param heatOpacity {float} průhlednost heatmapy mezi 0 a 1
        */
        heatmapLayer: function(data, heatGradient, heatRadius, heatOpacity){
            var pointArray = new google.maps.MVCArray(data);                         // vytvoří se nové MVC pole, do kterého se uloží data v podobě souřadnic
            var heatmap = new google.maps.visualization.HeatmapLayer({               // vytvoří se heat map vrstva podle uložených dat v pointArray
                data: pointArray
            });
             heatmap.set('gradient', heatmap.get('gradient') ? null : heatGradient);    // nastaví heat map na požadovaný gradient
             heatmap.set('radius', heatmap.get('radius') ? null : heatRadius);          // nastaví heat map na požadovaný radius
             heatmap.set('opacity', heatmap.get('opacity') ? null : heatOpacity);       // nastaví heat map na požadovanou průhlednost
             heatmap.setMap(this.map);                                                  // nastaví heat map na mapu
        },
        
        
  /***************************************************************************/
  /*                    GMAPY COORDINATES  / SOUŘADNICE                      */
  /***************************************************************************/
        
        /*
         * Return longitude and latitude coordinates separated by comma in reversed order
         * @method getCoordinatesLngLat
         * @param point {object} point on map
         * @return LnglatStr6 {String} return longitude latitude coordinates separated by comma
        */
        /**
         * Vrátí v opačném pořadí longitude a latitude souřadnice oddělené čárkou
         * @method getCoordinatesLngLat
         * @param point {object} bod na mapě
         * @return LnglatStr6 {String} vrací longitude latitude souřadnice oddělené čárkou
        */
        getCoordinatesLngLat: function(point){
            var LnglatStr6 = point.latLng.lng().toFixed(6) + ', ' + point.latLng.lat().toFixed(6);      // spojí longitude a latitude souřadnice a oddělí je čárkou
            return LnglatStr6;                                                                          // vrátí souřadnice v opačném pořadí jako string
        },
        
        /*
         * Return latitude and longitude coordinates separated by comma
         * @method getCoordinatesLatLng
         * @param point {object} point on map
         * @return LnglatStr6 {String} return latitude and longitude coordinates separated by comma
        */
        /**
         * Vrátí latitude a longitude souradnice oddelene carkou
         * @method getCoordinatesLatLng
         * @param point {object} bod na mapě
         * @return LnglatStr6 {String} vrací latitude longitude souřadnice oddělené čárkou
        */
        getCoordinatesLatLng: function(point){
            var LnglatStr6 = point.latLng.lat().toFixed(6) + ', ' + point.latLng.lng().toFixed(6);     // spojí latitude a longitude souřadnice a oddělí je čárkou 
            return LnglatStr6;                                                                         // vrátí souřadnice jako string 
        },
        
        /*
         * Return coordinates longitude latitude in reverse order
         * @method getMarkerCoordinatesLngLat
         * @param indexOfMarker {int} index of marker in markers array
         * @return markercoord {string} return longitude latitude coordinates of marker
         */
        /**
         * Vrátí souřadnice longitude latitude markeru v opačném pořadí
         * @method getMarkerCoordinatesLngLat
         * @param indexOfMarker {int} index markeru v poli markerů
         * @return markercoord {string} vrátí longitude latitude souřadnice markeru
         */
        getMarkerCoordinatesLngLat: function(indexOfMarker){
            var markerInArray = $(this.mapId).data(this.markers[indexOfMarker]);        // vybere podle indexu marker z pole
            var markercoordLat = markerInArray.getPosition().lat();                     // získá latitude souřadnici markeru získaného z pole markerů
            var markercoordLng = markerInArray.getPosition().lng();                     // získá longitude souřadnici markeru získaného z pole markeů
            var markercoord = markercoordLng + ', ' + markercoordLat;                   // spojí longitude a latitude souřadnice oddělené čárkou
            return markercoord;                                                         // vrátí jako string souřadnice v opačném pořadí
        },
        
        /*
         * Return coordinates latitude longitude of specific marker from array
         * @method getMarkerCoordinatesLatLng
         * @param indexOfMarker {int} index of marker in markers array
         * @return markercoord {string} return latitude longitude coordinates of marker
         */
        /**
         * Vrátí souřadnice latitude longitude konkrétního markeru v poli
         * @method getMarkerCoordinatesLatLng
         * @param indexOfMarker {int} index markeru v poli markerů
         * @return markercoord {string} vrátí latitude longitude souřadnice markeru
         */
        getMarkerCoordinatesLatLng: function(indexOfMarker){                            
            var markerInArray = $(this.mapId).data(this.markers[indexOfMarker]);        // získá z pole markerů marker na základě indexu
            var markercoord = markerInArray.position.toUrlValue();                      // uloží pozici (latitude longitude) markeru
            return markercoord;                                                         // vrátí pozici markeru jako string    
        },
        
        /*
         * Return latitude longitude coordinates of specific direction from array
         * @method getRouteCoordinatesLatLng
         * @param indexOfRoute {int} index of direction in directions array
         * @return routeCoordinates {array} return array of latitude longitude coordinates of route
         */
        /**
         * Vrátí souřadnice latitude longitude konkrétní trasy v poli
         * @method getRouteCoordinatesLatLng
         * @param indexOfRoute {int} index trasy v poli tras
         * @return routeCoordinates {array} vrátí pole latitude longitude souřadnic trasy
         */
        getRouteCoordinatesLatLng: function(indexOfRoute){
            var routeCoordinates = this.directionsArray[indexOfRoute].getDirections().routes[0].overview_path;  // uloží do pole všechny souřadnice (latitude longitude), které se nacházejí na dané trase
            return routeCoordinates;                    // vrátí pole souřadnic
        },
        
        /*
         * Return longitude latitude coordinates of specific direction from array in reverse order
         * @method getRouteCoordinatesLngLat
         * @param indexOfRouteStep {int} index of direction in directions array
         * @return routercoord {string} return longitude latitude coordinates of route
         */
        /**
         * Vrátí v opačném pořadí souřadnice longitude latitude konkrétní trasy v poli
         * @method getRouteCoordinatesLngLat
         * @param indexOfRouteStep {int} index trasy v poli tras
         * @return routercoord {string} vrátí longitude latitude souřadnice trasy
         */
        getRouteCoordinatesLngLat: function(indexOfRouteStep){
            var directionPoint = directionsDisplay.getDirections().routes[0].overview_path;     // uloží do pole všechny souřadnice (latitude longitude), které se nacházejí na dané trase
            var routeLat = directionPoint[indexOfRouteStep].lat();              // získá latitude souřadnice konkrétní trasy
            var routeLng = directionPoint[indexOfRouteStep].lng();              // získá longitude souřadnice konkrétní trasy
            var routercoord = routeLng + ', ' + routeLat;                       // spojí longitude a latitude souřadnice oddělené čárkou
            return routercoord;                                                 // vrátí jako string souřadnice v opačném pořadí
        },
        
        /*
         * Return latitude coordinate after geolocation
         * @method getGeolocateLatitude
         * @return {object} return latitude coordinate after geolocation
         */
        /**
         * Vrátí latitude souřadnici po geolokaci
         * @method getGeolocateLatitude
         * @return {Int} vrátí latitude souřadnici po geolokaci
         */
        getGeolocateLatitude: function(){
            return geolocCoords.coordLatitude;                                      // vrátí latitude souřadnici po geolokaci
        },
        
        /*
         * Return longitude coordinate after geolocation
         * @method getGeolocateLongitude
         * @return {object} return longitude coordinate after geolocation
         */
        /**
         * Vrátí longitude souřadnici po geolokaci
         * @method getGeolocateLongitude
         * @return {Int} vrátí longitude souřadnici po geolokaci
         */
        getGeolocateLongitude: function(){
            return geolocCoords.coordLongitude;                             // vrátí longitude souřadnici po geolokaci
        },
        
  /***************************************************************************/
  /*                   GMAPY SERVICES  / SLUŽBY                              */
  /***************************************************************************/ 
        
        /*
         * Display formatted address from latitude longitude coordinates into div element
         * @method getAddress
         * @param latLng {object} latitude longitude coordinates
         * @param divFormattedAddress {object} div in which will be displayed formatted address
        */
        /**
         * Zobrazí formatovanou adresu z latitude longitude souřadnic do zadaného div elementu
         * @method getAddress
         * @param latLng {object} latitude longitude souřadnice
         * @param divFormattedAddress {object} div, ve kterém bude zobrazena formátovaná adresa
        */
        getAddress: function(latLng, divFormattedAddress){                              
            geocoder.geocode( {'latLng': latLng},                                       // provede reverzní geokódování, kdy jsou zadány latLng souřadnice místo adresy
            function(results, status) {                                                 // na základě výsledků reverzního geokódování se zobrazí status
                if(status == google.maps.GeocoderStatus.OK) {                           // jestliže je vše v pořádku, zobrazí se formátovaná adresa v požadovaném HTML elementu
                    if(results[0]) {
//                        var p = document.getElementById(divFormattedAddress);
//                        p.innerHTML = results[0].formatted_address;
                       divFormattedAddress.innerHTML = results[0].formatted_address;

                    }
                    else {
                        divFormattedAddress.innerHTML = "No results";                   // není-li nalezena adresa vypíše se "No results"
                    }
                }
                else {
                    divFormattedAddress.innerHTML = status;                            // jinak se zobrazí status podle situace (statusy viz Google Maps API) 
                        
                }
            });
        },

        /*
	 * Convert kilometres to miles
         * @method kilometresToMiles
	 * @param km {float} kilometres
	 * @returns {float} return result in miles
	 */
        /**
	 * Převádí kilometry na míle
         * @method kilometresToMiles
	 * @param km {float} kilometry
	 * @returns {float} vrátí výsledek v mílích
	 */
	kilometresToMiles: function(km) {
		return km / 1.609344;                               // vydělí kilometry konstantou a získá výsledek v metrech
	},

	/*
	 * Convert miles to kilometres
         * @method milesToKilometres
	 * @param miles {float} miles
	 * @returns {float} return result in kilometres
	 */
        /**
	 * Převádí míle na kilometry
         * @method milesToKilometres
	 * @param miles {float} míle
	 * @returns {float} vrátí výsledek v kilometrech
	 */
	milesToKilometres: function(miles) {
		return miles * 1.609344;                            // vynásobí míle konstantou a získá výsledek v kilometrech
	},
        
        /*
	 * Convert meters to miles
         * @method metersToMiles
	 * @param meters {float} meters
	 * @returns {float} return result in miles
	 */
        /**
	 * Převádí metry na míle
         * @method metersToMiles
	 * @param meters {float} metry
	 * @returns {float} vrátí výsledek v mílích
	 */
        metersToMiles: function(meters){  
            return meters*0.000621371192;                       // vynásobí metry konstantou a získá výsledek mílích
        },
        
        /*
	 * Convert miles to meters
         * @method milesToMeters
	 * @param miles {float} míle
	 * @returns {float} return result in meters
	 */
        /**
	 * Převádí míle na metry
         * @method milesToMeters
	 * @param miles {float} míle
	 * @returns {float} vrátí výsledek v metrech
	 */
        milesToMeters: function(miles){  
            return miles*1609.344;                                          // vynásobí míle konstantou a získá výsledek v metrech
        },
        
        /*
         * Return distance between two points in metres
         * @method getDistance
         * @param p1 {object} starting point in latitude longitude coordinates
         * @param p2 {object} ending point in latitude longitude coordinates
         * @returns distanceKM {float} return distance in kilometres
        */
        /**
         * Vrací vzdálenost mezi dvěma body v metrech
         * @method getDistance
         * @param p1 {object} počáteční bod v latitude longitude souřadnicích
         * @param p2 {object} koncový bod v latitude longitude souřadnicích
         * @returns distanceKM {float} vrátí vzdálenost v kilometrech
        */
        getDistance: function(p1, p2) { 
            function rad(x) {                                               // funkce převede x na radiány
              return x * Math.PI / 180;                                     // vynásobí x konstantou PI a vydělí 180     
            }
            var R = 6378137;                                                // radius průměru země v metrech
            var dLat = rad(p2.lat() - p1.lat());                            // koncová mínus počáteční souřadnice lat převedena na radiány
            var dLong = rad(p2.lng() - p1.lng());                           // koncová mínus počáteční souřadnice lng převedena na radiány
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +               // proměnnou a použijeme při výpočtu haversinovy formule
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));         // haversinova formule
            var d = R * c;                                                  // spočtení vzdálenosti
            var distanceKM = Math.round(d / 100) / 10;                      // převedení z metrů na kilometry
            return distanceKM;                                              // vrátí vzdálenost v kilometrech
        },
        
        /*
         * Allow display direction path in textual form in the choosen div element
         * @method textDirections
         * @param divPanel {object} div element
        */
        /**
         * Umožní zobrazit trasu v textové podobě ve zvoleném div elementu
         * @method textDirections
         * @param divPanel {object} div element
        */
        textDirections: function(divPanel) {
              directionsDisplay.setPanel(document.getElementById(divPanel));            // zobrazí panel s doporučeným směrem jízdy na zadaném elementu
        },
        
        /*
         * Display direction between points on the map
         * @method displayRoute
         * @param origin {object} coordinates of starting point
         * @param destination {object} coordinates of ending point
         * @param travelMode {string} direction mode for computing route (options: driving (default), walking, bicycling, transit)
         * @param routeOptions {object} direction options acording google maps api
        */
        /**
         * Zobrazí trasu mezi body na mapě
         * @method displayRoute
         * @param origin {object} souřadnice počátečního bodu
         * @param destination {object} souřadnice koncového bodu
         * @param travelMode {string} mód cesty pro výpočet trasy (možnosti: driving (defaultně), walking, bicycling, transit)
         * @param routeOptions {object} vlastnosti trasy podle google maps api
        */
        displayRoute: function(origin, destination, travelMode, routeOptions) {
            var routeTravelMode;                                                                    
            directionsService = new google.maps.DirectionsService();                        // vytvoří directionService
            directionsDisplay = new google.maps.DirectionsRenderer({ preserveViewport: true, suppressMarkers: true, polylineOptions: routeOptions }); // vytvoří directionsRenderer nutný pro zobrazení trasy a jsou mu předány vlastnosti křivky
            directionsDisplay.setMap(this.map);                                             // nastaví trasu na mapu
            $(this.mapId).data(directionsDisplay.id, directionsDisplay);                    // uloží id trasy
            this.directionsArray.push(directionsDisplay);                                   // uloží trasu do pole
            var start = origin;                                                             // zadá souřadnice počátečního bodu
            var end = destination;                                                          // zadá souřadnice koncového bodu    
            var waypoints = [];                                                             // vytvoří pole pro mezi body na trase mezi počátečním a koncovým bodem
            for (var i = 1; i < this.markers.length - 1; i++) {                             // projede pole markerů
                waypoints.push({                                                            // naplní pole waypointů informacemi o markerech (pozice a zda se jedná o mezi bod)
                    location: $(this.mapId).data(this.markers[i]).getPosition(),
                    stopover: true
                });
            }  
            switch(travelMode) {                                                                // vybere mód trasy
                case 'driving': routeTravelMode = google.maps.TravelMode.DRIVING; break;        // pokud je v parametru pro zobrazení trasy driving, zvolí se trasa autem
                case 'walking': routeTravelMode = google.maps.TravelMode.WALKING; break;        // pokud je v parametru pro zobrazení trasy walking, zvolí se trasa pěšky
                case 'bicycling': routeTravelMode = google.maps.TravelMode.BICYCLING; break;    // pokud je v parametru pro zobrazení trasy bicycling, zvolí se trasa na kole
                case 'transit' : routeTravelMode = google.maps.TravelMode.TRANSIT; break;       // pokud je v parametru pro zobrazení trasy transit, zvolí se trasa veřejnou dopravou
                default : routeTravelMode = google.maps.TravelMode.DRIVING;                     // defaultně je nastave trasa autem
            }
            var request = {                                                             // požadavek na výpočet trasy        
              origin : start,                                                           // počáteční bod trasy
              destination : end,                                                        // koncový bod trasy
              waypoints: waypoints,                                                     // mezi body na trase
              travelMode : routeTravelMode                                              // mód trasy
            };
            directionsService.route(request, function(request, status) {                // zde je předán požadavek a je zavolána funkce
                if (status == google.maps.DirectionsStatus.OK) {                        // pokud je vše v pořádku, tak
                    directionsDisplay.setDirections(request);                           // nastavení požadavku
                    var route = request.routes[0];                                      // uloží do proměnné route požadavky na trasu
                    directionInfo.routeRequest = route;                                 // vlastnosti routeRequest objektu directionInfo nastaví jako hodnotu route 
                    for (var i = 0; i < route.legs.length; i++) {                      // projde pole souřadnic trasy
                        directionInfo.startAddress = route.legs[i].start_address;       // uloží adresu počátečního bodu
                        directionInfo.endAddress = route.legs[i].end_address;           // uloží adresu koncového bodu    
                        directionInfo.durationRoute = route.legs[i].duration.text;      // uloží dobu potřebnou pro překonání trasy   
                        directionInfo.distanceRoute = route.legs[i].distance.text;      // uloží vzdálenost trasy
                     }
                 }
            });  
        },
        
        /*
         * Clear route from map and array
         * @method clearRoutes
        */
        /**
         * Smaže trasu z mapy a pole
         * @method clearRoutes
        */
        clearRoutes: function(){
            for(var i=0; i<this.directionsArray.length; i+=1){                  // projde pole tras
                this.directionsArray[i].setMap(null);                           // nastaví viditelnost trasy na mapě na null
                this.directionsArray.splice(i, 1);                              // smaže trasu z pole
            }
            //directionsArray = [];
        },
        
        /*
         * Return request from created route
         * @method getRouteRequest
         * @returns {object} return request from created route
        */
        /**
         * Vrátí request z vytvořené trasy
         * @method getRouteRequest
         * @returns {object} vrátí request z vytvořené trasy
        */
        getRouteRequest: function(){  
            return directionInfo.routeRequest;                                      // vrátí požadavek na trasu
        },
        
        /*
         * Return address of starting point from created route
         * @method getStartAddress
         * @returns {object} return address of starting point from created route
        */
        /**
         * Vrátí adresu počátečního bodu z vykreslené trasy
         * @method getStartAddress
         * @returns {object} vrátí adresu počátečního bodu z vykreslené trasy
        */
        getStartAddress: function(){
            return directionInfo.startAddress;                                      // vrátí adresu počátečního bodu z vykreslené křivky
        },
        
        /*
         * Return address of ending point from created route
         * @method getEndAddress
         * @returns {object} return address of ending point from created route
        */
        /**
         * Vrátí adresu koncového bodu z vykreslené trasy
         * @method getEndAddress
         * @returns {object} vrátí adresu koncového bodu z vykreslené trasy
        */
        getEndAddress: function(){
            return directionInfo.endAddress;                                        // vrátí adresu koncového bodu z vykreslené křivky
        },
        
        /*
         * Return total time in hours and minutes, required for travelling displayed route
         * @method getDurationRoute
         * @returns {object} return total time in hours and minutes
        */
        /**
         * Vrátí celkový čas v hodinách a minutách, potřebný pro projetí vykreslené trasy
         * @method getDurationRoute
         * @returns {object} vrátí celkový čas v hodinách a minutách
        */
        getDurationRoute: function(){
            return directionInfo.durationRoute;                                     // vrátí celkový čas v hodinách a minutách, potřebný pro projetí vykreslené trasy
        },
        
        /*
         * Return total distance in kilometres between route points
         * @method getDistanceRoute
         * @returns {object} return total distance in kilometres of route
        */
        /**
         * Vrátí celkovou vzdálenost v kilometrech mezi body na vykreslené trase
         * @method getDistanceRoute
         * @returns {object} vrátí celkovou vzdálenost mezi body trasy
        */
        getDistanceRoute: function(){
            return directionInfo.distanceRoute;                         // vrátí celkovou vzdálenost v kilometrech mezi body na vykreslené trase
        },
        
        /*
         * Set travel mode for direction(možnosti: driving, walking, bicycling, transit)
         * @method travelModeChange
         * @param travelMode {string} travel mode 
         * @returns travelingMod {object} return travel mode
        */
        /**
         * Nastaví mód cesty pro trasu (možnosti: driving, walking, bicycling, transit)
         * @method travelModeChange
         * @param travelMode {string} mód cesty
         * @returns travelingMod {object} vrátí mód cesty
        */
        travelModeChange: function(travelMode){
            switch(travelMode) {                            // vybere mód cestování
                case 'driving': travelingMod = google.maps.TravelMode.DRIVING; break;     // pokud je v parametru pro zobrazení trasy driving, zvolí se trasa autem
                case 'walking': travelingMod = google.maps.TravelMode.WALKING; break;     // pokud je v parametru pro zobrazení trasy walking, zvolí se trasa pěšky
                case 'bicycling': travelingMod = google.maps.TravelMode.BICYCLING; break; //pokud je v parametru pro zobrazení trasy bicycling, zvolí se trasa na kole
                case 'transit' : travelingMod = google.maps.TravelMode.TRANSIT; break;    // pokud je v parametru pro zobrazení trasy transit, zvolí se trasa veřejnou dopravou
                default : travelingMod = google.maps.TravelMode.DRIVING;                  // defaultně je nastave trasa autem
            }
            return travelingMod;                                                          // vrátí mód cestování  
        },

        /*
         * Return a length of route array
         * @method lengthOfRouteArray
         * @param indexOfRoute {int} index of route in array
         * @returns {array} return an array of route coordinates
        */
        /**
         * Vrátí velikost pole souřadnic trasy
         * @method lengthOfRouteArray
         * @param indexOfRoute {int} index cesty v poli tras
         * @returns {array} vrátí pole souřadnic trasy
        */
        lengthOfRouteArray: function(indexOfRoute){
            var routeCoordinates = this.directionsArray[indexOfRoute].getDirections().routes[0].overview_path;  // uloží do pole souřadnice trasy
            return routeCoordinates.length;                     // vrátí délku pole routeCoordinates
        },
        
        /*
         * Return address of route start point
         * @method getRouteStartAddress
         * @param indexOfRoute {int} index of route in array 
         * @returns startaddress {object} return address
        */
        /**
         * Vrátí adresu počátečního bodu na trase
         * @method getRouteStartAddress
         * @param indexOfRoute {int} index cesty v poli trase
         * @returns startaddress {object} vrátí adresu
        */
        getRouteStartAddress: function(indexOfRoute){
            var startaddress = directionsDisplay.getDirections().routes[0].legs[indexOfRoute].start_address;    // uloží do proměnné startaddress počáteční adresu trasy
            return startaddress;                        // vrátí adresu počátečního bodu
        },
        /*
         * Return address of route end point
         * @method getRouteEndAddress
         * @param indexOfRoute {int} index of route in array 
         * @returns endaddress {object} return address
        */
        /**
         * Vrátí adresu koncového bodu na trase
         * @method getRouteEndAddress
         * @param indexOfRoute {int} index cesty v poli trase
         * @returns endaddress {object} vrátí adresu
        */
        getRouteEndAddress: function(indexOfRoute){
            var endaddress = directionsDisplay.getDirections().routes[0].legs[indexOfRoute].end_address;    // uloží do proměnné endaddress koncovou adresu trasy
            return endaddress;                          // vrátí adresu koncového bodu
        },
        getRouteDistanceKM: function(indexOfRoute){
            var routedistanceKM = directionsDisplay.getDirections().routes[0].legs[indexOfRoute].distance.text;  // uloží do proměnné routedistanceKM vzdálenost trasy mezi body
            return routedistanceKM;                     // vrátí vzdálenost v kilometrech
        },

        /*
         * Display value of elevation after event in the created div element 
         * @method getElevation
         * @param event {object} event acording google maps
         * @param placeElevation {string} name of object in which will be displayed elevation value
        */
        /**
         * Zobrazí hodnotu výškového profilu po uskutečnění zadané události ve vytvořeném div elementu 
         * @method getElevation
         * @param event {object} označení události podle google maps
         * @param placeElevation {string} název objektu, ve kterém se zobrazí hodnota výškového profilu
        */
        getElevation: function(event, placeElevation){
            elevator = new google.maps.ElevationService();                  // vytvoří ElevationService nutné pro zjištění výškového profilu
                    var locations = [];                                     // 
                    locations.push(event.latLng);
                    var positionalRequest = {                               // vytvoří LocationElevationRequest object využívající jednu hodnotu pole
                      'locations': locations
                    };
                    elevator.getElevationForLocations(positionalRequest, function(results, status) { 
                        if (status == google.maps.ElevationStatus.OK) {             
                            // Retrieve the first result
                            if (results[0]) {                                       // obdržení prvního výsledku
                              var list = document.getElementById(placeElevation);
                              list.innerHTML = results[0].elevation;                // výsledek zobrazí v uživatelem zadaném elementu
                                 elevationsArray.push(results[0].elevation);        // přidá výsledek do pole
                            } else {
                              alert("No results found");                            // hláška, pokud není nalezen výsledek
                            }
                        } else {
                            alert("Elevation service failed due to: " + status);    // hláška, pokud služba Elevation selže
                        }
                    });
        },
        
        /*
         * Display elevation graph
         * @method displayElevate
         * @param path {array} array of points which will be represented as a graph
         * @param divDisplay {object} div for displaying graph
         * @param drawCh {object} graphical options of the graph
         * @param pathReq {object} path request
        */
        /**
         * Zobrazí výškový profil v grafu
         * @method displayElevate
         * @param path {array} pole bodů,které budou reprezentovány jako graf
         * @param divDisplay {object} div pro zobrazení grafu
         * @param drawCh {object} grafické vlastnosti grafu
         * @param pathReq {object} požadavky na cestu
        */
        displayElevate: function(path, divDisplay, drawCh, pathReq) {
            
            google.load('visualization', '1', {packages: ['columnchart']});     // nahraje z knihovny visualization graf columnchart
            google.maps.event.addDomListener(window, 'load', initialize(path,divDisplay, pathReq)); // po načtení se provede inicializace
            google.setOnLoadCallback(initialize);                           
            
       /*
         * Funkce, která zobrazi vyskovy profil v grafu
         * @method initialize
         * @param path {array} pole bodů, jejichz spojovaci cesta je zanesena do grafu
         * @param divDisplay {div} div, kde se zobrazi graf
        */
            function initialize(path, divDisplay, pathReq) {
                elevator = new google.maps.ElevationService();      // vytvoří ElevationService
                chart = new google.visualization.ColumnChart(document.getElementById(divDisplay)); // z knihovny visualization nahraje graf (columnchart)
                var pathRequest = pathReq;                          // předá požadavky na graf (vzorkování, atd.)
                elevator.getElevationAlongPath(pathRequest, plotElevation);     // vytvoří graf podle zadané trasy
            }

            function plotElevation(results) {
                elevations = results;                           // předá výsledky zjištění výškového profilu trasy
                var elevationPath = [];
                for (var i = 0; i < results.length; i++) {
                    elevationPath.push(elevations[i].location);         // uloží výsledky do pole
                }
                var data = new google.visualization.DataTable();        // vytvoří tabulku s daty
                data.addColumn('string', 'Vzorek');                     // nastaví sloupec pro vzorek
                data.addColumn('number', 'Vyskovy profil');             // nastaví sloupec pro výškový profil vzorku    
                for (var i = 0; i < results.length; i++) {
                    data.addRow(['', elevations[i].elevation]);         // postupně přidává do tabulky řádky s daty
                }
                var drawChart = drawCh;                                 // předá grafické vlastnosti grafu, například (barva, opacita,...)
                chart.draw(data, drawChart);                            // vykreslí graf na základě získaných dat a požadovaného vzhledu
            }     
        },
        
        /*
         * Provides geocoding
         * @method geocode
         * @param address {object} address
         * @param options {object} options of geocoding acording google maps
        */
        /**
         * Poskytuje geokódování
         * @method geocode
         * @param address {object} adresa
         * @param options {object} vlastnosti geokódování podle google maps
        */
        geocode: function(address, options) {
            var Gmapy = this;
            setTimeout(function() {                                 // se spožděním se vykoná geokódování 
                geocoder.geocode({'address': address.address}, function(results, status) {      // provede geokódování na zadanou adresu
                    if (status == google.maps.GeocoderStatus.OK && address.center)          // pokud je vše v pořádku a je zadáno vycentrování
                        Gmapy.map.setCenter(results[0].geometry.location);                  // vycentruje na nalezené místo
                    if (status == google.maps.GeocoderStatus.OK && options && options.markerId) // pokud je vše v pořádku a je zadáno id markeru
                        options.markerId.setPosition(results[0].geometry.location);             // nastaví marker na nalezenou pozici
                    else if (status == google.maps.GeocoderStatus.OK && options) {              // jinak povolí geokódování a nastaví v options pozici na nalezenou a vytvoří marker
                        if (Gmapy.lockGeocode) {
                            Gmapy.lockGeocode = false;
                            options.position = results[0].geometry.location;
                            options.geocode = true;
                            Gmapy.createMarker(options);
                        }
                    }
                    else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {           // pokud je dosažen limit pro hledání, zavolá se funkce geocode znovu
                        Gmapy.geocode(address, options);
                    }
                });
            }, this.opts.delay);
        },
        
        
  /***************************************************************************/
  /*                   GMAPY EVENTS  / UDÁLOSTI                              */
  /***************************************************************************/
        
        /*
         * Create listener
         * @method createListener
         * @param type {string} type of object (options: object, map, marker)
         * @param event {string} name of event
         * @param data {function} function performed after event triggering
        */
        /**
         * Vytvoří listener
         * @method createListener
         * @param type {string} typ objektu (options: object, map, marker)
         * @param event {string} název události
         * @param data {function} funkce, která se vykoná po spuštění události
        */
        createListener: function(type, event, data) {
            var target;
            if (typeof type != 'object')                                // pokud není type nastaven na 'object', pak se nastaví typ zadaný uživatelem
                type = {type: type};
            if (type.type == 'map')                                     // pokud je typ nastaven na 'map', pak je target nastaven na mapu
                target = this.map;
            else if (type.type == 'marker' && type.marker)              // jestliže je typ nastaven na marker, pak je target nastaven na marker
                target = $(this.mapId).data(type.marker);
            else if (type.type == 'info' && type.marker)                // jestliže je typ nastaven na info, pak je type nastaven na marker    
                target = $(this.mapId).data(type.marker + 'info');
            if (target)                                                     // pokud je target nastaven:
                return google.maps.event.addListener(target, event, data);  // vrátí listener na nastavený target, na určitou událost a s určitými daty
            else if ((type.type == 'marker' || type.type == 'info')) // jestliže typ je marker nebo info a zároveň není počet markerů stejný jako počet tmpmarkerů, pak
                var Gmapy = this;
            setTimeout(function() {                                         // spustí se funkce createListener s určitým zpožděním
                Gmapy.createListener(type, event, data);
            }, this.opts.delay);
        },
       
        /*
         * Remove listener
         * @method removeListener
         * @param listener {object} listener designed for removing
        */
       /**
         * Vyjme listener
         * @method removeListener
         * @param listener {object} listener určený pro vyjmutí
        */
        removeListener: function(listener) {
            google.maps.event.removeListener(listener);                 // odstraní listener, podle zadaného listeneru
        },      
        
  /***************************************************************************/
  /*                      GMAPY DRAWING MANAGER                              */
  /***************************************************************************/
        
        /*
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
        /**
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
            switch(defaultDrawMode) {                                           // vybere defaultní nastavení módu kreslení    
                case 'marker': defDrawMode = google.maps.drawing.OverlayType.MARKER; break;
                case 'circle': defDrawMode = google.maps.drawing.OverlayType.CIRCLE; break;
                case 'polygon': defDrawMode = google.maps.drawing.OverlayType.POLYGON; break;
                case 'polyline' : defDrawMode = google.maps.drawing.OverlayType.POLYLINE; break;
                case 'rectangle' : defDrawMode = google.maps.drawing.OverlayType.RECTANGLE; break;
                default : null;
            }
            switch(controlPosition) {                                           // vybere pozici na mapě, kde bude drawing manager zobrazen
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
            drawingManager = new google.maps.drawing.DrawingManager({           // vytvoří a zobrazí drawing manager
                drawingMode: defDrawMode,                                       // nastaví defaultní mód kreslení
                drawingControl: true,                                           // nastaví ovládání kreslení
                drawingControlOptions: {                                        // vlastnosti drawing managera
                    position: cntrlPosition,                                    // vlastnost - pozice
                    drawingModes: showModes                                     // které módy kreslení se budou zobrazovat
                },
                markerOptions: markerOpt,                                       // nastaví vlastnosti markeru
                circleOptions: circleOpt,                                       // nastaví vlastnosti kruhu
                polygonOptions: polygonOpt,                                     // nastaví vlastnosti polygonu            
                polylineOptions: polylineOpt,                                   // nastaví vlastnosti křivce    
                rectangleOptions: rectangleOpt                                  // nastaví vlastnosti obdélníku
                
            });
            google.maps.event.addListener(drawingManager, "overlaycomplete", function(event){   // přidá listener, který po dokončení vytvoření vrstvy na mapě, zavolá fukci
                all_overlays.push(event);                                               
                overlayClickListener(event.overlay);                                 // zavolá funkci overlayClickListener a předá jí jako parametr událost na vrstvě
                polygonsDrawingM.push(event.overlay.getPath().getArray());           // uloží do pole pole souřadnic dané vrstvy   
                $('#vertices').val(event.overlay.getPath().getArray());              
            });
            
            function overlayClickListener(overlay) {                                // zobrazí pole souřadnic dané vrstvy v objektu vertices
                google.maps.event.addListener(overlay, "mouseup", function(event){
                    $('#vertices').val(overlay.getPath().getArray());
                });
            }
            drawingManager.setMap(this.map);                                        // nastaví vrstvu na mapu
        },
        getDrawingManagerPolygonLatLng: function(indexOfPolygon){
            var polygonInArray = this.polygonsDrawingM[indexOfPolygon];             // uloží souřadnice polygonu do proměnné polygonInArray podle zadaného indexu
            var polygoncoord = polygonInArray.position.toUrlValue();                // vypíše pozici polygonu
            return polygoncoord;                                                    // vrátí pozici polygonu
        },
        
        /*
         * Hide Drawing Manager
         * @method hideDrawingManager
         */
        /**
         * Skryje Drawing Manager
         * @method hideDrawingManager
         */
        hideDrawingManager: function() {
            drawingManager.setOptions({                 // nastaví drawing manageru vlastnost zneviditelnit se
                drawingControl: false
            });
        },
        
        /*
         * Show Drawing Manager
         * @method showDrawingManager
         */
        /**
         * Zobrazí Drawing Manager
         * @method showDrawingManager
         */
        showDrawingManager: function() {
            drawingManager.setOptions({                         // nastaví drawing manageru vlastnost zviditelnit se
                drawingControl: true
            });
        },
        
        /*
         * Delete all Drawing Manager shapes from map
         * @method deleteDrawingManagerShape
         */
        /**
         * Smaže všechny tvary Drawing Manageru z mapy
         * @method deleteDrawingManagerShape
         */
        deleteDrawingManagerShape: function() {
           for (var i=0; i < all_overlays.length; i++){         // projede pole všech vrstev
                all_overlays[i].overlay.setMap(null);           // nastaví všechny vrstvy z pole na mapě na null
            }
            all_overlays = [];                                  // vyprázdní celé pole
        }
    } 
    
})(jQuery);
