 define(["jQuery", "Handlebars", "style", "googleMaps","text!templates/pageOne.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, style, googleMaps, pageoneTemplate, accordionPageTemplate) {


    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);

    var apiKey = "/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b";
    var baseUrl = "http://www.semanticwire.com/api/v2.1/", result, filter;
    var callPoint ="filters";
    var extension = ".json";
    var fullUrl = baseUrl + callPoint + apiKey + extension; 

    var timeFilter = {Filter:{start_date:'2 July 2012', end_date:'9 July 2012', conditions :{and:{Topic:[{id:2}]}}}};
    var url = "http://www.semanticwire.com/api/v2.1/library/CityDisambiguated/limit:100.json";
    var cond = {"conditions":{
                          "latitude": "41.9",
                          "longitude": "12.5",
                          "radius": 50}};
    var Data = {};
    var key, count = 0;
    var points = {};
    var jsonObj = [];
    var jsonPlaceIds = [];
    var jsonPlacesFilters = []; 
    var circlesArray = [];
    var markerCircle = [];
    var i;

 function getClickPoint(eventName){
  //var clickPoint = require(googleMaps).sendClickPoint();
 require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&language=en!callback"], function() {
  //var map = googleMaps.map;
  //debugger;

  var map = googleMaps.drawMap();
  var phpRestURL = 'http://localhost/pasta/scripts/backend/'; 
  // console.log(map);
  // var marker = new google.maps.Marker({
  //             position: new google.maps.LatLng(41.900233,12.494202),
  //             map: map
  //     });

  google.maps.event.addListener(map, 'click', function(event){
                    //infoWindow.setContent('clicked' + event.latLng.lat()) ;


        if (circlesArray.length > 0){
            circlesArray[0].setMap(null);
            circlesArray.length = 0;
        }

        var lat = Math.round((event.latLng.lat()) * 10000)/10000;
        var lng = Math.round((event.latLng.lng()) * 10000)/10000;
        clickPoint = [];
        clickPoint.push({latitude: lat, longitude:  lng });
        //alert(clickPoint[0].latitude + ", " + clickPoint[0].longitude);
        //semanticwire.getClickPoint();

        var circleOptions = {
        center: new google.maps.LatLng(lat,lng),
        radius: 100000,
        map: map
        };

        var circle = new google.maps.Circle(circleOptions);
        circlesArray.push(circle); 

        //var data = {"latitude" : lat, "longitude" : lng };
        //var dataString = JSON.stringify(data);
        //$.post('scripts/backend.php', { data: dataString}, showResult, "text");

        $.ajax({
          type: 'GET',
          url: phpRestURL + "coordinates/" + lat + "," + lng,
          dataType: 'json',
          success: function(data){
           
              var key, count = 0;
              for(key in data.coords) {
                count++;
              }
              //alert(data.coords[0].name + "\n" + count);
          }
        });

          //   console.log('addCoord');
          //   $.ajax({
          //     type: 'POST',
          //     contentType: 'application/json',
          //     url: phpRestURL + "/coordinates",
          //     dataType: "json",
          //     data: formToJSON(),
          //     success: function(data, textStatus, jqXHR){
          //       alert('Coords inserted successfully');
          //     },
          //     error: function(jqXHR, textStatus, errorThrown){
          //       alert('add error: ' + textStatus);
          //     }
          //   });

        function formToJSON() {
          return JSON.stringify({
            "lat": lat,
            "lng": lng
            });
        }

          // $.ajax({
          //   type: 'PUT',
          //   contentType: 'application/json',
          //   url: phpRestURL + '/coordinates/50000',
          //   dataType: "json",
          //   data: formToJSON(),
          //   success: function(data, textStatus, jqXHR){
          //     alert('Coords updated successfully');
          //   },
          //   error: function(jqXHR, textStatus, errorThrown){
          //     alert('updateCoords error: ' + textStatus);
          //   }
          // });

          //var points = semanticwire.getPlaces();

        var cond2 =  {"conditions":{
            "latitude": lat,
            "longitude": lng,
            "radius": 50}};

        jsonObj = [];
        $.ajax({
            url: url,
            data: cond2,
            type: 'POST',
            dataType: 'json',
            async: false, //wait for result then continue the code
            success: function(data) {
                Data = data.data;
                var lat, lng
                 
                for(key in Data){
                  if (Data[key].CityDisambiguated.news_score > 1){
                    count++;
                    lat = Data[key].CityDisambiguated.latitude;
                    lng = Data[key].CityDisambiguated.longitude;
                    jsonObj.push({latitude: lat, longitude:  lng });
                    jsonPlaceIds.push({id: Data[key].CityDisambiguated.id});

                  }
                }
               
             },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('Error:' + textStatus);
            }
        });

        if (markerCircle.length > 0) {
          for (i in markerCircle) {
            markerCircle[i].setMap(null);
          }
          markerCircle.length = 0;
        }
       
        for (i=0; i < jsonObj.length; i++){
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(jsonObj[i].latitude,jsonObj[i].longitude),
            map: map   
          });
             markerCircle.push(marker);
        }

        var conditions;
        var jsonArrayIds = [];
        for (i = 0; i < jsonPlaceIds.length; i++){
         jsonArrayIds.push({id:jsonPlaceIds[i].id});
        }
         conditions = {"Filter": {"start_date": "-7 days","end_date": "now","conditions": {"or": {"CityDisambiguated": jsonArrayIds}}}};
         //alert(conditions);
          $.ajax({
            url: fullUrl,
            data: conditions,
            type: 'POST',
            dataType: 'json',
            async: false, //wait for result then continue the code
            success: function(data) {
                Data = data.data;
                jsonPlacesFilters.push({filter: Data.Filter.id})
             },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('Error:' + textStatus);
            }
        });

        var documents = "documents/";
        var pagination = "/limit:10000/count:1";
        var urlPool = baseUrl + documents + Data.Filter.id + pagination + apiKey + extension;
        // http://www.semanticwire.com/api/v2.1/documents/4fff5277-8e6c-433a-aee7-19dfc0a8007b/limit:10000/count:1/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b.json

         // news pool
          $.ajax({
            url:urlPool,
            async:false,
            success: function(data){ Data = data.data;},
            dataType:"json"
          });

          var accordionValues;

        var bodyAccordion = $("#bodyAccordion");
        var articles = 7; //for example

        // $.each(Data, function(index, row) {
        //         row.Document.title = $('<div>' + row.Document.title + '</div>').text();
        //         row.Document.description = $('<div>' + row.Document.description + '</div>').text();
        //   }
        for(var i = 0; i < articles; i++){
            accordionValues = {
                article: Data[i].Document.title,
                articleBody: Data[i].Document.description
            };
            accordionValues.accItemId = "acc" + i;
            bodyAccordion.append(fillAccordionPageTemplate(accordionValues));
        }

  });//event listener

}); //require

  // var clickLat = clickPoint[0].latitude;
  // var clickLong =clickPoint[0].longitude;

} //function getClickPoint


 function semanticWireAgent(eventName){
        
//time filter:
        // $.ajax({
        //   type:"POST",
        //   url:fullUrl,
        //   data: timeFilter,
        //   async:false,
        //   //contentType: "text/xml; charset=utf-8",
        //   success: function(data){Data = data.data;},
        //   dataType:"json"
        // });

        // $('#pageOne').append(Data.Filter.id);
     
           // $.ajax({
           //    url: url,
           //    data: cond,
           //    type: 'POST',
           //    dataType: 'json',
           //    async: false, //wait for result then continue the code
           //    success: function(data) {
           //        Data = data.data;
           //        var lat, lng
                   
           //        for(key in Data){
           //          if (Data[key].CityDisambiguated.news_score > 1){
           //            count++;
           //            lat = Data[key].CityDisambiguated.latitude;
           //            lng = Data[key].CityDisambiguated.longitude;
           //            jsonObj.push({latitude: lat, longitude:  lng });
           //          }
           //        }
                 
           //     },
           //    error: function(jqXHR, textStatus, errorThrown) {
           //        alert('Error:' + textStatus);
           //    }
           // });



    // var documents = "documents/";
    // var pagination = "/limit:10000/count:1";
    // var urlPool = baseUrl + documents + Data.Filter.id + pagination + apiKey + extension;
    // // http://www.semanticwire.com/api/v2.1/documents/4fff5277-8e6c-433a-aee7-19dfc0a8007b/limit:10000/count:1/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b.json

//news pool
    //     $.ajax({
    //       url:urlPool,
    //       async:false,
    //       success: function(data){ Data = data.data;},
    //       dataType:"json"
    //     });

    // $('#pageOne').append(Data[0].Document.title);


    // // var newsPool = {
    // //     items: [
    // //         {title: Data[0].Document.title , description: Data[0].Document.description},
    // //         {title: Data[1].Document.title, description: Data[1].Document.description}
    // //     ]
    // // };




    

    }

    function getPlaces(eventName){
      return jsonObj;
    }
   
   function test2(eventName){
    return require("googleMaps").test1();
   }

   function test4(eventName){
    return "test4";
   }
   


    return {
        semanticWireAgent: semanticWireAgent,
        getPlaces: getPlaces,
        test2: test2,
        test4: test4,
        getClickPoint: getClickPoint
       
    }


});