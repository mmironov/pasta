define(["jQuery", "Handlebars", "text!templates/pageOne.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, pageoneTemplate, accordionPageTemplate) {

  var clickPoint=[];
  var map;

function drawMap(eventName){

        var phpRestURL = 'http://localhost/pasta/scripts/backend/'; 


      // here we require the GMaps library and then we show the map
        require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&language=en!callback"], function() {

        //	semanticwire.semanticWireAgent();

            var initialPoint = new google.maps.LatLng(42.389638,13.29269);
            var DEFAULT_ZOOM = 7; //3 to 8
            var myOptions = {
                center: initialPoint,
                zoom: DEFAULT_ZOOM,
                minZoom: DEFAULT_ZOOM - 4,
                maxZoom: DEFAULT_ZOOM + 1,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
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

            var infoWindow = new google.maps.InfoWindow({
                content: 'zoom info',
                position: initialPoint
            });
            //infoWindow.open(map);

            // google.maps.event.addListener(map, 'zoom_changed', function(){
            //     var zoomLevel = map.getZoom();
            //     infoWindow.setContent('zoom ' + zoomLevel);
            // })
          

            /*var marker = new google.maps.Marker({
              position: map.getCenter(),
              map: map,
              title: 'Click to zoom'
            });

            google.maps.event.addListener(map, 'center_changed', function() {
              // 3 seconds after the center of the map has changed, pan back to the
              // marker.
              window.setTimeout(function() {
                map.panTo(marker.getPosition());
              }, 3000);
            });

            google.maps.event.addListener(marker, 'click', function() {
              map.setZoom(8);
              map.setCenter(marker.getPosition());
            });*/

          //end
        }); //require

return map;

} //function drawMap

function test1(eventName){
  return "test1";
}

// function test3(eventName){
//   return semanticwire.test4();
// }



// function sendClickPoint(eventName){
//   return clickPoint;
// }

function flagClicked(eventName, var1){
  return var1;
}

var clickedPoints = 'Ivano';

 return {
        drawMap: drawMap
       // clickedPoints: clickedPoints,
      //  test1: test1,
        //test3: test3,
        
       // sendClickPoint: sendClickPoint,
      //  flagClicked: flagClicked
    }


});

