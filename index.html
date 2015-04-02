<!DOCTYPE html> 
<html> 
<head> 
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" /> 
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/> 
<title>Gmapy.js</title> 

<link type="text/css" href="styles.css" rel="stylesheet" /> 
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
<script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=true"></script>
<script type="text/javascript" src="gmapy.js"></script>

<script type="text/javascript" src="https://www.google.com/jsapi"></script>
<script src="https://www.google.com/uds/?file=visualization&amp;v=1&amp;packages=columnchart" type="text/javascript"></script>

<script type="text/javascript"   src="http://geoxml3.googlecode.com/svn/branches/polys/geoxml3.js"></script>

<script type="text/javascript"> 
     
$(document).ready(function() {
	$("#mapa").Gmapy({ 
                addMarker: false,
//                markers: [{  
//                    latitude: 56.948813, 
//                    longitude: 24.704004, 
//                    id: 'info1', 
//                    html: { 
//                        content: 'Auto popup!', 
//                        popup: true 
//                    } 
//                }],
		polyline: {
			color: "#FFFF00"
		}, 
		overlays: [{
			type: 'circle',
			id: 'c',
			latitude: 48.812028800000010000, 
			longitude: 14.316137300000036000,
			radius: 20000
		}, {
			type: 'rectangle',
			id: 'r',
			ne: {  
				latitude: 50.1629359, 
				longitude: 17.574812500000007
			},
			sw: { 
				latitude: 49.97784069999999, 
				longitude: 16.97177540000007
			}
		}, {
			type: 'polyline',
			id: 'pl',
			coords: [{  
					latitude: 50.1067, 
					longitude: 14.2678
				},{ 
					latitude: 50.230164, 
					longitude: 12.865711
				},{ 
					latitude: 50.644457900000000000, 
					longitude: 13.835284000000001000
				}]
		}, {
			color: 		"#00CC00",
			fillColor: 		"#00CC00",
			type: 'polygon',
			id: 'pg',
			coords:	[{
					latitude: 50.210360500000000000,//57.707050,
					longitude: 15.825210999999967000
				},{ 
					latitude: 50.414572199999990000,
					longitude: 16.165634700000055000
				},{ 
					latitude: 50.1175574,
					longitude: 16.290679400000045
				},{
					latitude: 50.210360500000000000,
					longitude: 15.825210999999967000
				}]
		}]
	});
        
        var dayIndex = 1;
        var tableRef;
        var tMode;

	$.Gmapy.createCircle({
		id: 'liberec',
		latitude: 50.766279999999990000,
		longitude: 15.054338700000017000,
		radius: 30000
	});
        
        var changeIndex = false;
        var u = 0;
        function pointToItinerary() {
             var b = 0;    
             var list = document.getElementById('itineraryBox');
             var ul=document.createElement('ulPoint');
             var li=document.createElement('liPoint');
             var liIW=document.createElement('liIWPoint');
             var liAddress=document.createElement('liAddress');
             list.appendChild(ul);
             ul.appendChild(li);
             ul.appendChild(liIW);
             ul.appendChild(liAddress);
             tableRef = document.getElementById('itineraryTable');
             
             
             for (var i=0, l = $.Gmapy.markers.length; i < l; i++) {
                
                if(changeIndex === true){
                    b = u;
                }else{
                    b = i;  
                }
                var markerEdit = '<a href="#"> marker </a>' + b + '  ' + '<a href="#"> Smaž </a>';
                var markerInfoWin = "<input type='text' name='textInfoWindow" + b + "' value='info window" + b + "' id='textInfoWindow" + b + "' /><input type='submit' name='button" + b + "' id='button" + b + "' value='OK' /><select id='markerColor" + b + "' name='markerColor'><option value='http://maps.google.com/mapfiles/ms/icons/purple-dot.png'>fialova</option><option value='http://maps.google.com/mapfiles/ms/icons/red-dot.png'>cervena</option><option value='http://maps.google.com/mapfiles/ms/icons/blue-dot.png'>modra</option><option value='http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'>zluta</option><option value='http://maps.google.com/mapfiles/ms/icons/green-dot.png' selected='selected'>zelena</option></select><input type='submit' name='buttonIcon" + b + "' id='buttonIcon" + b + "' value='Icon' /><br/>";

//               
//                // Insert a row in the table at the last row
//                var newRow = tableRef.insertRow();
//                // Insert a cell in the row at index 0
//                var newCell = newRow.insertCell();
//                var newCell2 = newRow.insertCell();
//                newCell.innerHTML= markerEdit;
//                newCell2.innerHTML= markerInfoWin;
                li.innerHTML= markerEdit;
                liIW.innerHTML = markerInfoWin;
                
             }
             var infoWindowValue;
             $("#button" + b + "").click(function(){                   
                    infoWindowValue = document.getElementById("textInfoWindow" + b + "").value;
                    $.Gmapy.setInfoWindow($.Gmapy.markers[b], {content: infoWindowValue, title: infoWindowValue}, b);
             });
             $("#buttonIcon" + b + "").click(function(){ 
                    var markerIcon = document.getElementById("markerColor" + b + "").value;
                    $.Gmapy.setMarker($.Gmapy.markers[b], {icon: markerIcon, content: infoWindowValue, title: infoWindowValue});
                    
             });
             li.firstChild.onclick = function() {
                var markerInfo = document.getElementById("lastRouteInfo");       
                $.Gmapy.getAddress($($.Gmapy.mapId).data($.Gmapy.markers[b]).getPosition(), markerInfo);
  
             };
             li.lastChild.onclick = function() {  
                $('#itineraryBox').empty();
                $.Gmapy.removeMarker($.Gmapy.markers[b]);
                changeIndex = true;
                u = 0;
                for (var l = $.Gmapy.markers.length; u < l; u++) {
                    pointToItinerary();
                }
                changeIndex = false;
                $.Gmapy.clearRoutes();
                $.Gmapy.displayRoute($($.Gmapy.mapId).data($.Gmapy.markers[0]).getPosition(), $($.Gmapy.mapId).data($.Gmapy.markers[$.Gmapy.markers.length-1]).getPosition(), tMode, directionOptions());
             };
        };

        $.Gmapy.createListener({type:'map'}, 'click', function(event) {  
             
             var konec = $.Gmapy.createMarker({  
                latitude: event.latLng.lat(),
		longitude: event.latLng.lng()
             }); 
             pointToItinerary();
             var start = new google.maps.LatLng(56.971927, 24.078027);
             var end = new google.maps.LatLng(57.707078, 37.635156);
             $.Gmapy.getDistance(start, end);
        }); 
        
        $.Gmapy.createListener({type:'map'}, 'mousemove', function(point) {  
             gob('over').options[0].text = $.Gmapy.getCoordinatesLngLat(point);

        });
        
        
        $("#deleteMarkersButton").click(function() { 
            $('#itineraryBox').empty();
            $.Gmapy.clearRoutes();
            $.Gmapy.clearMarkers();
            
            
        });

	$("#del1").click(function() {
		$.Gmapy.removeOverlay('polyline', 'pl');
	});

	$("#del2").click(function() {
		$.Gmapy.clearOverlays('rectangle');
	});

	$("#set1").click(function() {
		$.Gmapy.setOverlay('circle', 'riga', { 
			strokeColor: '#ffffff',
			fillColor: '#ddd',
			weight: 1
		});
	});

	$("#sh1").click(function() {
		$.Gmapy.showHideOverlay('circle', 'c');
	});

	$("#sh2").click(function() {
		$.Gmapy.showHideOverlay('polygon', 'pg', false);
	});

	$("#sh3").click(function() {
		$.Gmapy.showHideOverlay('polygon', 'pg', true);
	});


	$("#count").click(function() {
		var text = 
			'polygon: ' + $.goMap.getOverlaysCount('polygon') + "\n" +
			'polyline: ' + $.goMap.getOverlaysCount('polyline') + "\n" +
			'circle: ' + $.goMap.getOverlaysCount('circle') + "\n" +
			'rectangle: ' + $.goMap.getOverlaysCount('rectangle');
		alert(text); 
	});

	$("#b1").click(function() {
		$.Gmapy.createCircle({
			color: '#00cc00',
			weight:	1,
			fillColor: '#00cc00',
			latitude: 50.025383, 
			longitude: 8.21377,
			radius: 60000
		});
	});

	$("#b2").click(function() {
		$.Gmapy.createPolyline({
			color: "#00CC00",
			opacity: 0.5,
			weight:	4,
			coords:	[{
					latitude: 55.841394,
					longitude: 48.99502
				},{ 
					latitude: 53.189575, 
					longitude: 50.313379
				},{ 
					latitude: 48.651052,
					longitude: 44.424707
			}]
		});
	});

	$("#b3").click(function() {
		$.Gmapy.createPolygon({
			color: "#00CC00",
			fillColor: 'transparent',
			fillOpacity:	0.0,
			weight: 	2,
			coords:	[{
					latitude: 58.092393, 
					longitude: 9.883691
				},{ 
					latitude: 54.281258,
					longitude: 13.487207
				},{ 
					latitude: 54.740475,
					longitude: 5.752832
			}]
		});
	});

	$("#b4").click(function() {
		$.Gmapy.createRectangle({
			fillColor: 'transparent',
			ne: {  
				latitude: 51.416334,
				longitude: 23.858301
			},
			sw: { 
				latitude: 48.184396, 
				longitude: 11.993066
			}
		});
	});
        $("#hidElevate").click(function() {
		$.Gmapy.hideElevate();
	});
        $("#showElevate").click(function() {
                var path = [];
                for (var i = 0, l = $.Gmapy.markers.length; i < l; i++) {
                    path.push($($.Gmapy.mapId).data($.Gmapy.markers[i]).getPosition());
                }
		$.Gmapy.displayElevate(path, 'elevation_chart');
	});
        $("#showRoute").click(function() {
                $.Gmapy.clearRoutes();
                $.Gmapy.displayRoute($($.Gmapy.mapId).data($.Gmapy.markers[0]).getPosition(), $($.Gmapy.mapId).data($.Gmapy.markers[$.Gmapy.markers.length-1]).getPosition(), tMode, directionOptions());
	});
        $("#kmlBS").click(function() {
                var kmlTextValue = document.getElementById("kmlAdress").value;
		$.Gmapy.getKML(kmlTextValue);
	});
        
        $("#createNewDay").click(function() {
             var listOfDays = document.getElementById('itineraryBox');
             var ul=document.createElement('ulDay');
             var li=document.createElement('liDay');
             var ulPoint=document.createElement('ulPoint');
             var liPoint=document.createElement('liPoint');
             var liIWPoint=document.createElement('liIWPoint');
             listOfDays.appendChild(ul);
             ul.appendChild(li);
             li.appendChild(ulPoint);
             ulPoint.appendChild(liPoint);
             ulPoint.appendChild(liIWPoint);
//             tableRef = document.getElementById('itineraryTable');
//             // Insert a row in the table at the last row
//             var newRow = tableRef.insertRow();
//             // Insert a cell in the row at index 0
//             var newCell  = newRow.insertCell(0);
             var itemItinerary ="DEN "+ dayIndex +"</br>";
             li.innerHTML = itemItinerary;
             dayIndex++;
	});
       
        $.Gmapy.getCoordinatesLngLat();
        
        function travelMode(routeTravelMode){
            tMode = routeTravelMode;
        }
        
        $('#DrivingBtn').click(function() {
            tMode = "driving"; 
        });
        $('#WalkingBtn').click(function() {
            tMode = "walking"; 
        });
 
});     

//        function routeInfoDisplay(){
//            for (var i = 0; i<$.Gmapy.directionsArray.length; i++) {
//                var routeInfo = document.getElementById("wholeRouteInfo");
//                routeInfo.innerHTML = "";
//                routeInfo.innerHTML = "<b>Z: </b>" + $.Gmapy.getRouteStartAddress(i); + " <br /> ";
//                routeInfo.innerHTML += "<br /><b>Do: </b>" + $.Gmapy.getRouteEndAddress(i); + " <br /> ";
//                routeInfo.innerHTML += "<br /><b>Vzdálenost: </b>" + $.Gmapy.getRouteDistanceKM(i); + " <br /> ";
//            }
//        }
        
        function codeAddress() {
            var address = document.getElementById('address').value;
            $.Gmapy.geocode({address: address, center: true});
        }

        
        function selectTextarea(){
            gob('kmlString').focus();
            gob('kmlString').select();
        }
    
        function gob(e){
            if(typeof(e)=='object')return(e);
            if(document.getElementById)return(document.getElementById(e));
            return(eval(e));
        }


        function placemarkobject() {
            this.name = "distribution/range";
            this.desc = "";
            this.polygonstyle = "rangecolour";
            this.linestyle = "linecolour";
            this.curstyle = 0;
            this.tess = 1;
            this.alt = "clampToGround";
            this.plmtext = "";
            this.jstext = "";
            this.toolID = 1;
            this.hole = 0;
            this.ID = 0;
        }
        
//        function createplacemarkobject() {
//            var thisplacemark = new placemarkobject();
//            placemarks.push(thisplacemark);
//        }
        

        function directionOptions(){
            var inputColorCode = document.getElementById("colorCode");
            var inputOpacity = document.getElementById("opacityVal");
            var inputWeight = document.getElementById("weightVal");
            
            return {strokeWeight: inputWeight.value, strokeColor: '#'+inputColorCode.value, strokeOpacity: inputOpacity.value};
        }
        
    function float2color( percentage ) {
        var percentageValue = parseFloat(percentage.replace(",", "."));
        var color_part_dec = 255 * percentageValue;
        var color_part_hex = Number(parseInt( color_part_dec , 10)).toString(16);
        return color_part_hex;
    }
     
        function logCoordinates(){
            var docuname = "KML file";
            var docudesc = "Line";
        //    var polyShape;
            //var polyPoints = new Array();
            
        //    var holePoints = new Array();
            var placemarks = new Array();
        //    var polygonstyles = new Array();
        //    var polylinestyles = new Array();
        //    var polygonMode = false;
            var plmcur = 0;
        //    var cur = 0;
        //    var holecoords = new Array();
        //
        //    polyPoints = polyShape.getPath();
        
        var inputColorCode = document.getElementById("colorCode");
        var inputStyleID = document.getElementById("styleID");
        var inputWeight = document.getElementById("weightVal");
        var inputOpacity = document.getElementById("opacityVal");
        var hexAlpha = inputOpacity.value;
        
        var thisplacemark = new placemarkobject();
            placemarks.push(thisplacemark);
           
        
                gob("kmlString").value = "";
                gob("kmlString").value = '<'+'?xml version="1.0" encoding="UTF-8"?>\n'+
                '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
                gob("kmlString").value += '<Document><name>'+docuname+'</name>\n'+
                '<description>'+docudesc+'</description>\n';
        //        var last = "";
        //        var length = polygonstyles.length;
        //        if (length > 1) {
        //            for (var i=0; i<length; i++) {
        //                if (polygonstyles[i].name != last) {
        //                    gob("kmlString").value += '<Style id="'+polygonstyles[i].name+'">\n' +
        //                    '<LineStyle><color>'+polygonstyles[i].kmlcolor+'</color><width>'+polygonstyles[i].width+'</width></LineStyle>\n' +
        //                    '<PolyStyle>\n<color>'+polygonstyles[i].kmlfill+'</color>\n' +
        //                    '</PolyStyle>\n' +
        //                    '</Style>\n';
        //                    last = polygonstyles[i].name;
        //                }
        //            }
        //            for (var i=0; i<length; i++) {
        //                if (polylinestyles[i].name != last) {
                         if (typeof $.Gmapy.directionsArray !== 'undefined' && $.Gmapy.directionsArray.length > 0) {
                            gob("kmlString").value += '<Style id="'+inputStyleID.value+'">\n' +
                            '<LineStyle><color>'+float2color(hexAlpha) + inputColorCode.value+'</color><width>'+inputWeight.value+'</width></LineStyle>\n' +
                            '</Style>\n';
                         }
        //                    last = polylinestyles[i].name;
        //                }
        //            }
        //        }else{ // only 1 polygonstyle and 1 polylinestyle
        //            gob("kmlString").value += '<Style id="'+polygonstyles[cur].name+'">\n' +
        //            '<LineStyle><color>'+polygonstyles[cur].kmlcolor+'</color><width>'+polygonstyles[cur].width+'</width></LineStyle>\n' +
        //            '<PolyStyle>\n<color>'+polygonstyles[cur].kmlfill+'</color>\n' +
        //            '</PolyStyle>\n' +
        //            '</Style>\n' +
        //            '<Style id="'+polylinestyles[cur].name+'">\n' +
        //            '<LineStyle><color>'+polylinestyles[cur].kmlcolor+'</color><width>'+polylinestyles[cur].width+'</width></LineStyle>\n' +
        //            '</Style>\n';
        //        }
               
                //gob("kmlString").value += '<Point><coordinates>'+$.Gmapy.getMarkerCoordinates(i)+'</coordinates></Point></Placemark>\n';
                for(var i = 0, l = $.Gmapy.markers.length; i < l; i++){ 
                      gob("kmlString").value += '<Placemark> \n';
                      if (typeof $.Gmapy.infoWindowsArray !== 'undefined' && $.Gmapy.infoWindowsArray.length > 0) {
                        gob("kmlString").value += '<name>'+placemarks[plmcur].name+'</name><description>'+ $.Gmapy.getInfo(i) +'</description>\n';
                      }
                      gob("kmlString").value += '<Point><coordinates>'+$.Gmapy.getMarkerCoordinatesLngLat(i)+'</coordinates></Point></Placemark>\n';
                        
                }
                
               
        //        if(polygonMode) {
        //            gob("kmlString").value += '<styleUrl>#rangecolour</styleUrl>\n'+
        //            '<Polygon>\n'+
        //            '<tessellate>'+placemarks[plmcur].tess+'</tessellate><altitudeMode>'+placemarks[plmcur].alt+'</altitudeMode>\n'+
        //            '<outerBoundaryIs><LinearRing><coordinates>\n';
        //        }else{
                if (typeof $.Gmapy.directionsArray !== 'undefined' && $.Gmapy.directionsArray.length > 0) {
                    gob("kmlString").value += '<Placemark>\n'+
                    '<styleUrl>#'+inputStyleID.value+'</styleUrl>\n'+
                    '<LineString>\n'+
                    '<tessellate>'+placemarks[plmcur].tess+'</tessellate><altitudeMode>'+placemarks[plmcur].alt+'</altitudeMode>\n'+
                    '<coordinates>\n';
//        //        }
                for (var i = 0; i<$.Gmapy.directionsArray.length; i++) {
                    //var longiLat = $.Gmapy.getRouteCoordinatesLatLng();
                    for (var j = 0; j<$.Gmapy.lengthOfRouteArray(i); j++) {
                        gob("kmlString").value += $.Gmapy.getRouteCoordinatesLngLat(j) + ",0 \n";
                    }
                }
        //
        //        if(polygonMode) {
        //            gob("kmlString").value += '</coordinates></LinearRing></outerBoundaryIs>\n';
        //            //if(holesignal == 1) {
        //                for(var i = 0; i < holecoords.length; i++) {
        //                    gob("kmlString").value += '<innerBoundaryIs><LinearRing><coordinates>\n';
        //                    gob("kmlString").value += holecoords[i];
        //                    gob("kmlString").value += '\n</coordinates></LinearRing></innerBoundaryIs>\n';
        //                }
        //            //}
        //            gob("kmlString").value += '</Polygon>\n';
        //        }else{
                    gob("kmlString").value += '</coordinates>\n'+
                    '</LineString>\n';
        //        }
                    gob("kmlString").value += '</Placemark>\n';
                   }
                gob("kmlString").value += '</Document>\n'+
                '</kml>';
        }

</script> 
</head> 
<body> 
<div id="logoPlanner"></div>
        
    <div id="menu1">
        <table>
        <tr>
        <td>
        <ul class="menu">
        <li><a href="../html/">Příklady</a>
        <ul>
        <li><a href="newMap.html">mapa a marker</a></li>
        <li><a href="events.html">události</a></li>
        <li><a href="route.html">trasa</a></li>
        <li><a href="geocode.html">geokodovani</a></li>
        <li><a href="polyline.html">křivka</a></li>
        <li><a href="polygon.html">polygon</a></li>
        </ul>
        </li>
        </ul>
        </td>
        <td>
        <ul class="menu">
        <li><a href="../css/">Dokumentace</a>
        <ul>
        <li><a href="out/index.html">v češtině</a></li>
<!--        <li><a href="../css/margin/">v angličtině</a></li>-->
        </ul>
        </li>
        </ul>
        </td>
        <td>
        <ul class="menu">
        <li><a href="index.html">Gmapy.js</a>
        <ul>
<!--        <li><a href="../php/kniha_navstev.php">Průvodce plánovačem</a></li>-->
        <li><a href="aboutGM.html">O gmapy.js</a></li>
        </ul>
        </li>
        </ul>
        </td> 
        </table>
     </div>
     <div id="menu2">
        <select id="over" style="margin: 4px; width:180px;" >
            <option>Latitude, Longitude</option>
            <option selected="selected">Souradnice LatLng</option>
        </select>
        <input id="address" type="text" value="Ostrava, Czech Republic" style="width: 250px">
        <input type="button" value="Geocode" onclick="codeAddress()">
     </div>
<div id="wrap">
	<div id="content">
		<br/>
		<div id="mapa">MAP</div>
        <div id="gmap-dropdown" style="height: 400px; width: 500px;"></div>
<!--        <div id="boxInfo3">
            <h2>Vzdalenost:</h2>
            <ul id="dist"></ul>
        </div>-->
        
        <div id="itineraryBoxHead">ITINERÁŘ
                <input id="deleteMarkersButton" type="button" value="Smazat body">
                <input id="createNewDay" type="button" value="Vytvořit den">
        </div>
        <div id="itineraryBox">
<!--            <table id="itineraryTable"></table>-->
           <ul id="ulDay"> 
            <li id="liDay" style="list-style-type: none; margin-top: -10px; margin-left: -30px;"> 
               <ul id="ulPoint" style="list-style-type: none;">
                <li id="liPoint" style="list-style-type: none; margin-top: -10px; margin-left: -30px;"></li>
                <li id="liIWPoint" style="list-style-type: none; margin-top: -10px; margin-left: -30px;"></li>
               </ul>
            </li>
           </ul>
         
        </div>
        <div id="saveBox">
<!--            <input id = "fileupload" type = "file" />
            <input type = "submit" value = "Show KML" id = "kmlBS" />-->
            <input type="text" name="kmlAdress" value="" id="kmlAdress" style="width: 150px"/>    
            <input type="button" name="kmlBS" value="Zobraz KML" id="kmlBS" />
            
            <input type="file" name="kmlFile" id="kmlFile"/>
            <input type="button" name="kmlFileBtn" id="kmlFileBtn" value="Import KML" onclick="$.Gmapy.parseKML($('#kmlFile').val()); for (var u=0, l = $.Gmapy.markers.length; u < l; u++) {
                    pointToItinerary();
                }" />
        </div>
        <div id="infoBoxHead1">Info o celé trase
<!--            <input type="button" name="hidElevate" value="Skryj" id="hidElevate" />-->
<!--            <input type="button" name="b5" value="Info o trase" id="b5" onclick="routeInfoDisplay();"/>-->
            <input type="button" name="showElevate" value="Výškový profil" id="showElevate" />            
        </div>
        <div id="wholeRouteInfo">

        </div>
        <div id="elevation_chart" onmouseout="clearMouseMarker()"></div>
        <div id="infoBoxHead2">Info o bodu
            <input type="button" name="showRoute" value="Zobrazit trasu" id="showRoute" />
        </div>
        <div id="lastRouteInfo">
        </div>
        <div id="elevation_chart_last"></div>
        <div id="drawingPanel"> 
            <input type="button" name="colorBtn" value="Nastavit křivku" id="setDirectBtn" onclick="$.Gmapy.clearRoutes(); $.Gmapy.displayRoute($($.Gmapy.mapId).data($.Gmapy.markers[0]).getPosition(), $($.Gmapy.mapId).data($.Gmapy.markers[$.Gmapy.markers.length-1]).getPosition(), 'driving', directionOptions());"/>
            <button type="submit" name="DrivingBtn" id="DrivingBtn" data-name="driving"><img src="img/car.png" alt="autem"/><br/></button>
            <button type="submit" name="WalkingBtn" id="WalkingBtn" data-name="walking" ><img src="img/walking.png" alt="pěšky"/><br/></button>
            <button type="submit" name="BicyclingBtn" id="BicyclingBtn" data-name="bicycling" ><img src="img/bicycle.png" alt="na kole"/><br/></button>
            <button type="submit" name="TransitBtn" id="TransitBtn" data-name="transit" ><img src="img/bus.png" alt="veřejnou dopravou"/><br/></button>
            <form id="polyOptions" style="padding-bottom:1px;" action="./" method="post" onsubmit="return false">
               <table>
                   <tr><td><div id="labelColor">Barva křivky: </div></td><td><input type="text" name="color" value="0000FF" id="colorCode" /></td></tr>
<!--                   <tr><td><div id="labelOpacity">Opacita křivky: </div></td><td><input type="text" name="opacity" value="255" id="opacityVal" /></td></tr>-->
                   <tr><td><div id="labelOpacity">Opacita křivky: </div></td><td><input type="number" name="opacity" value="0.8" min="0" max="1" step="0.1" id="opacityVal" style="width: 40px"/></td></tr>
                   <tr><td><div id="labelWeight">Tloušťka křivky </div></td><td><input type="text" name="weight" value="6" id="weightVal" /></td></tr>
<!--                   <tr><td><div id="labelFColor">Barevná výplň: </div></td><td><input type="text" name="fillcolor" id="fillColor" /></td></tr>
                   <tr><td><div id="labelFOpacity">Opacita výplně: </div></td><td><input type="text" name="fillopacity" id="fillOpacity" /></td></tr>-->
                   <tr><td><div id="labelStyleID">Style id: </div></td><td><input type="text" name="styleid" value="Cesta" id="styleID" /></td></tr>
               </table>
            </form>
<!--            <div id="polygonsF">-->
<!--                <input type="button" name="b1" value="create circle" id="b1" />
		<input type="button" name="b2" value="create polyline" id="b2" />
		<input type="button" name="b3" value="create polygon" id="b3" />
		<input type="button" name="b4" value="create rectangle" id="b4" />
		<br/>
		<input type="button" name="sh1" value="show / hide circle by id" id="sh1" />
		<input type="button" name="sh2" value="hide polygon by id" id="sh2" />
		<input type="button" name="sh3" value="show polygon by id" id="sh3" />
		<br/>
		<input type="button" name="count" value="overlays count" id="count" />
		<input type="button" name="del1" value="remove polyline by id" id="del1" />
                  -->
                  
        </div>
        <input type="button" id="generateKML" value="Generovat KML" onclick="logCoordinates()"/>
        <input style="width:150px" id="copySelectedBtn" type="button" onclick="selectTextarea();" value="Vyber text"/>
        <div id="kmlDiv"><textarea id="kmlString"></textarea></div>
<!--	<div id="mrk" style="height: 100px; overflow: auto">Content from #info1</div>-->
	</div>
</div> 
</body> 
</html> 

