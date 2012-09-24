define(["jQuery", "Handlebars", "MarkerClusterer", "text!templates/pageOne.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, MarkerClusterer, pageoneTemplate, accordionPageTemplate) {

  var map, drawingManager;

function drawMap(eventName){

      // here we require the GMaps library and then we show the map
        require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&libraries=drawing&language=en!callback"], function() {
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
              zoomControl: true, //to do - to remove because it's only for pc version
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
          mapCanvas.css({
              "width": $(document).width() + "px",
              "height": $(document).height() + "px"
          });
        map = new google.maps.Map(document.getElementById(mapCanvas.attr("id")), myOptions);
        map.setOptions({styles:styleArray});
        google.maps.event.trigger(map, 'resize');

        drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.LEFT_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.CIRCLE]
        },
        circleOptions: {
          fillColor: '#000000',
          fillOpacity: 0.3,
          strokeWeight: 2,
          clickable: false,
          zIndex: 1,
          editable: true
        }
      });
      drawingManager.setMap(map);
        


          var goldStar = {
            path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
            //path: google.maps.SymbolPath.CIRCLE,
            fillColor: "dodgerblue",
            fillOpacity: 0.8,
            scale: 0.15,
            strokeColor: "royalblue",
            strokeWeight: 4
          };

          // var marker = new google.maps.Marker({
          //   position: new google.maps.LatLng(41.900233,12.494202),
          //   icon: goldStar,
          //   map: map
          // });

          // var infoWindow = new google.maps.InfoWindow({
          //     content: 'zoom info',
          //     position: new google.maps.LatLng(41.900233,12.494202)
          // });
         // infoWindow.open(map);

          // google.maps.event.addListener(map, 'zoom_changed', function(){
          //     var zoomLevel = map.getZoom();
          //     infoWindow.setContent('zoom ' + zoomLevel);
          // })
        

          // var marker = new google.maps.Marker({
          //   position: map.getCenter(),
          //   map: map,
          //   title: 'Click to zoom'
          // });

          // google.maps.event.addListener(map, 'center_changed', function() {
          //   // 3 seconds after the center of the map has changed, pan back to the
          //   // marker.
          //   window.setTimeout(function() {
          //     map.panTo(marker.getPosition());
          //   }, 3000);
          // });

          // google.maps.event.addListener(marker, 'click', function() {
          //   //map.setZoom(8);
          //   //map.setCenter(marker.getPosition());
          //   infoWindow.open(map);
          // });

        }); //end require

  return [map, drawingManager];

} //end function drawMap

 return {
        drawMap: drawMap
    }

});

