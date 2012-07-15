define(["jQuery", "Handlebars", "style", "semanticwire", "text!templates/pageOne.html", "text!templates/subPage.html", "text!templates/accordionPage.html"], function($, Handlebars, style, semanticwire, template, subPageTemplate, accordionPageTemplate) {

    // here we compile the two templates we will use, so that later we just need to fill them with dynamic values
    var fillTemplate = Handlebars.compile(template);
    var fillSubPageTemplate = Handlebars.compile(subPageTemplate);
    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);

    function render(eventName) {
        // create the whole page and put it into the DOM

        var values = {
            fillMe: "value",
            imgSrc: "./resources/logo.png"
        };

        $("body").html(fillTemplate(values));

        var categories = ["All","Technology","Education","Business","Sport","Health","Entertainment"];        

        // fill the list of links and put each of them into the DOM
        var linkValues = {
            //linkUrl: "http://www.di.univaq.it/malavolta",
           linkUrl: "#"
        };

        // linksContainer is saved in a local variable because each jquery call is very costly in terms of performance
        var linksContainer = $("#linksContainer");
        for(var i = 0; i < categories.length; i++) {
            linkValues.urlName = categories[i];
            linksContainer.append(fillSubPageTemplate(linkValues));
        }

         style.setStyle();
         semanticwire.semanticWireAgent();

          //alert(newsPool.items[0].description);

        //accordion - adding items
        // var accordionValues = {
        //     article: "Article",
        //     articleBody: "Some text some text some text some text some text some text some text some text some text"
        // };

        // var bodyAccordion = $("#bodyAccordion");
        // var articles = 7; //for example
        // for(var i = 0; i < articles; i++){
        //     accordionValues.accItemId = "acc" + i;
        //     bodyAccordion.append(fillAccordionPageTemplate(accordionValues));
        // }
        
        //accordion effect
        $("#logo").click(function(){
        $(".panel").toggle("fast");
       // $(this).toggleClass("active");
        return false;
    });


        // $.ajax({
        //   type: "POST",
        //   url: "scripts/backend.php",
        //   data: { name: "John", location: "Boston" }
        // }).done(function( msg ) {
        //   alert( "Data Saved: " + msg );
        // });
    
    
    // $('#txtValue').keyup(function(){
    //             sendValue($(this).val());   
    //             }); 
 
    //     function sendValue(str){
    //         $.post("scripts/backend.php",{ sendValue: str },
    //         function(data){
    //             $('#pageOne').html(data.returnValue);
    //         }, "json");
            
    //     }
    
    // var dataString = "krisi";
    // $.ajax({
    // type: "POST",
    // url: "scripts/backend.php",
    // data: { 'dataString': dataString },
    // //cache: false,
    // success: function()
    //     {
    //         alert("Order Submitted");
    //     }
    // });


  // $.post("backend.php", '',
  //               function(data) {
  //                   alert(data.value1); 
  //                   alert(data.value2);
  //           }, "json");
//   

//  var data = 
//   { 
//     "sales": [ 
//       { "firstname" : "John", "lastname" : "Brown" },
//       { "firstname" : "Marc", "lastname" : "Johnson" }
//     ] // end of sales array
//   };
//   var dataString = JSON.stringify(data);
//   $.post('scripts/backend.php', { data: dataString}, showResult, "text");

 
// function showResult(res)
// {
//   $("#fullresponse").html("Full response: " +res);
//   var obj = JSON.parse(res);
//   $("#sales1Lastname").html("Lastname of sales[1]: " +obj.sales[1].lastname);
// }


// $.ajax
//     ({
//         type: 'POST',
//         cache: false,
//         async: false,
//         timeout: 10000,
//         url : 'scripts/backend.php',
//         dataType : 'json',  //defines expected response datatype
//         contentType : 'application/json', //defines request datatype
//         data : { "test" : "hello world"},
//         success : function(json)
//         {
//            //do some stuff here.
//            alert(json);
//         }});



        // here we require the GMaps library and then we show the map
        require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&language=en!callback"], function() {

//            console.log(data);

            var initialPoint = new google.maps.LatLng(42.389638,13.29269);
            var DEFAULT_ZOOM = 6; //3 to 8
            var myOptions = {
                center: initialPoint,
                zoom: DEFAULT_ZOOM,
                minZoom: DEFAULT_ZOOM - 3,
                maxZoom: DEFAULT_ZOOM + 2,
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
            var map = new google.maps.Map(document.getElementById(mapCanvas.attr("id")), myOptions);
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

            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(41.900233,12.494202),
              icon: goldStar,
              map: map
            });

            var infoWindow = new google.maps.InfoWindow({
                content: 'zoom info',
                position: initialPoint
            });
            //infoWindow.open(map);

            // google.maps.event.addListener(map, 'zoom_changed', function(){
            //     var zoomLevel = map.getZoom();
            //     infoWindow.setContent('zoom ' + zoomLevel);
            // })

            var circlesArray = [];


            google.maps.event.addListener(map, 'click', function(event){
                    //infoWindow.setContent('clicked' + event.latLng.lat()) ;
                    
                    if (circlesArray.length > 0){
                        circlesArray[0].setMap(null);
                        circlesArray.length = 0;
                    }

                    var lat = Math.round((event.latLng.lat()) * 10000)/10000;
                    var lng = Math.round((event.latLng.lng()) * 10000)/10000;
                    
                    var circleOptions = {
                    center: new google.maps.LatLng(lat,lng),
                    radius: 100000,
                    map: map
                    };

                    var circle = new google.maps.Circle(circleOptions);
                    circlesArray.push(circle); 

                      var data = { "points": [ {"latitude" : lat, "longitude" : lng }]}
                      var dataString = JSON.stringify(data);
                      $.post('scripts/backend.php', { data: dataString}, showResult, "text");

            });
                



 
function showResult(res)
{
  $("#fullresponse").html("Full response: " + res);
 var obj = jQuery.parseJSON(res);
 alert(obj);
  $("#sales1Lastname").html("Long: " + obj.points[0].longitude);
}

            
             // var mrk = new google.maps.Marker({
             //            position: new google.maps.LatLng(0,0),
             //            map: map
             //        });
        


          

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
        });
    }

    return {
        render: render
    }
});