define(["jQuery", "Handlebars", "MarkerClusterer", "text!templates/pageOne.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, MarkerClusterer, pageoneTemplate, accordionPageTemplate) {

    var map, drawingManager, path, canvasProjectionOverlay, circleBound,  polygon;
    var canvas, context, paint;
    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var clickLatLng = new Array();

    function drawMap(eventName){

      // here we require the GMaps library and then we show the map
      require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&libraries=drawing,geometry&language=en!callback"], function() {
        var clickPoint=[];
        var initialPoint = new google.maps.LatLng(42.389638,13.29269); //to do - change with user's location
        var DEFAULT_ZOOM = 7; //3 to 8
        var myOptions = {
            center: initialPoint,
            zoom: DEFAULT_ZOOM,
            minZoom: DEFAULT_ZOOM - 4,
            maxZoom: DEFAULT_ZOOM + 1,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true, //to do - to remove because it's only for desktop version
            zoomControlOptions: {position:google.maps.ControlPosition.LEFT_CENTER}
        };

        var styleArray = [
        {
            stylers:[
            //{hue: "#00ffe6"},
            {hue:"#0d7d00"},
            {saturation:-20}]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers:[
            {lightness:100},
            {visibility:"simplified"}]
        },
        {
            featureType: "road",
            elementType: "labels",
            stylers:[
            {visibility:"off"}]
        }
        , {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [
              { visibility: "on" },
              {hue: "#d7ecea"},
              //{ hue: "#ff00bb" }, //pink
              { saturation: -50 },
              { lightness: 33 }
            ]
        }
        ]

        var mapCanvas = this.$("#map");
        
        // the map must have static dimensions (that is, you cannot use percentages here)
        (mapCanvas).css({
            "width": $(document).width() + "px",
            "height": ($(document).height() - 45) + "px" //-45 because of the menu height = 45px (otherwise - scrollbar appears)
        });

        map = new google.maps.Map(document.getElementById(mapCanvas.attr("id")), myOptions);
        map.setOptions({styles:styleArray});
        google.maps.event.trigger(map, 'resize');

        //in order to use the function fromContainerPixelToLatLng() I need to create class that derives from OverlayView 
        //and call the getProjection() method which returns a MapCanvasProjection type //this is that hard only in api v3
        function CanvasProjectionOverlay() {}
        CanvasProjectionOverlay.prototype = new google.maps.OverlayView();
        CanvasProjectionOverlay.prototype.constructor = CanvasProjectionOverlay;
        CanvasProjectionOverlay.prototype.draw = function(){}; //I need this before call getProjection()
        
        canvasProjectionOverlay = new CanvasProjectionOverlay();
        canvasProjectionOverlay.setMap(map);

        //in order to get the center of the shape drawn by the user
        google.maps.Polygon.prototype.getBounds = function() {

          var bounds = new google.maps.LatLngBounds();
          var paths = this.getPaths();
          var path;
          
          for (var p = 0; p < paths.getLength(); p++) {
            path = paths.getAt(p);
            for (var i = 0; i < path.getLength(); i++) {
                    bounds.extend(path.getAt(i));
            }
          }
          return bounds;
        }
      
        var polygonOptions = {
          strokeColor: '#00c42f', //'#00aeff' , <- blue
          strokeOpacity: 1.0,
          strokeWeight: 3,
          fillOpacity: 0.2
        }

        polygon = new google.maps.Polygon(polygonOptions);
        
        drawingManager = new google.maps.drawing.DrawingManager({
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.CIRCLE]
          },
          circleOptions: {
            fillColor: '#000000',
            fillOpacity: 0.2,
            strokeWeight: 2,
            strokeColor: "#00c42f",
            clickable: false,
            zIndex: 1,
            editable: false
          }
        });
        
        drawingManager.setMap(map);
          
      }); //end require

      initDrawingCanvas();

      $("#drawMode").bind("click", function(){ 
        clickX = [];
        clickY = [];
        clickDrag = [];
      });

      return [map, drawingManager, canvasProjectionOverlay];

    } //end function drawMap

    function initDrawingCanvas() {
      canvas = document.getElementById('canvas');
      context = canvas.getContext('2d');
      canvas.addEventListener('mousedown', ev_mousedown, false);
      canvas.addEventListener('mousemove', ev_mousemove, false);
      canvas.addEventListener('mouseup', ev_mouseup, false);
      canvas.addEventListener('mouseleave', ev_mouseleave, false);
    }

    function ev_mousedown(e){
      var mouseX = e.pageX - this.offsetLeft;
      var mouseY = e.pageY - this.offsetTop;
      paint = true;
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      redraw();
    }
                      
    function ev_mousemove(e){
      if(paint){
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        redraw();
      }
    }   
     
    function ev_mouseup(e){
      paint = false;
      makePath();
      $("#canvas").css("display", "none");
      $("#drawModeClear").css("display","block");
      returnCircle();
    }
        
    function ev_mouseleave(e){
      paint = false;
    }

    function addClick(x, y, dragging)
    {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
    }

    function makePath(){
      require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&libraries=drawing,geometry&language=en!callback"], function() {
        
        polygon.setMap(map);
        var drawnPoints = new google.maps.MVCArray();

        for(var i = 0; i < clickX.length; i++){
          drawnPoints.push(canvasProjectionOverlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(clickX[i], clickY[i])));
        }
        
        polygon.setPath(drawnPoints);
        var center = polygon.getBounds().getCenter();

        var maxDistance = distanceBetween2Points(center.lat(), center.lng(), drawnPoints.getAt(0).lat(), drawnPoints.getAt(0).lng());
        for(var i = 1; i < drawnPoints.getLength(); i++){
            if (maxDistance < distanceBetween2Points(center.lat(), center.lng(), drawnPoints.getAt(i).lat(), drawnPoints.getAt(i).lng())){
              maxDistance = distanceBetween2Points(center.lat(), center.lng(), drawnPoints.getAt(i).lat(), drawnPoints.getAt(i).lng())
            }
        }

        var circleTest = {
          fillColor: '#000000',
          fillOpacity: 0,
          strokeWeight: 0,
          clickable: false,
          zIndex: 1,
          editable: false,
          radius: maxDistance*1000,
          center: center,
          map: map
        }

        circleBound = new google.maps.Circle(circleTest);
        
        console.log("maxdistance " + maxDistance);
      });
    }

    function returnCircle(){
      //it's not working when I send only the polygon, I have to investigate why
      return [circleBound, polygon];
    }

    function redraw(){
      
      canvas.width = canvas.width; // Clears the canvas
      
      context.strokeStyle = "#00c42f"; //"#00aeff";
      context.lineJoin = "round";
      context.lineWidth = 1;
                
      for(var i=0; i < clickX.length; i++)
      {        
        context.beginPath();
        if(clickDrag[i] && i){
          context.moveTo(clickX[i-1], clickY[i-1]);
         }
         else{
           context.moveTo(clickX[i]-1, clickY[i]);
         }
         context.lineTo(clickX[i], clickY[i]);
         context.closePath();
         context.stroke();
      }
    }

    function distanceBetween2Points(lat1, lng1, lat2, lng2){ //google api is also providing something in geometry.spherical namespace
      if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
          return this * Math.PI / 180;
        }
      }

      var earthRadius = 6371; // km
      var dLat = (lat2-lat1).toRad();
      var dLng = (lng2-lng1).toRad();
      var lat1 = lat1.toRad();
      var lat2 = lat2.toRad();

      //haversine formula
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var distance = earthRadius * c;
      return distance;
    }

    return {
      drawMap: drawMap,
      distanceBetween2Points: distanceBetween2Points,
      returnCircle : returnCircle
    }

});

