 define(["jQuery", "Handlebars", "style", "googleMaps", "MarkerClusterer", "text!templates/pageOne.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, style, googleMaps, MarkerClusterer, pageoneTemplate, accordionPageTemplate) {


    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);

    var apiKey = "/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b";
    var baseUrl = "http://www.semanticwire.com/api/v2.1/";
    var callPoint ="filters";
    var extension = ".json";
    var fullUrl = baseUrl + callPoint + apiKey + extension; 
    var url = "http://www.semanticwire.com/api/v2.1/library/CityDisambiguated/limit:100.json";
    var urlPool, infoWindow;
    var i, j, Data = {};

 function getClickPoint(eventName){
   require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&language=en!callback"], function() {

    var map = googleMaps.drawMap();
    //map.addControl(new GLargeMapControl());

    //var phpRestURL = 'http://localhost/pasta/scripts/backend/'; 
    var circleOptions, lat, lng, circle, condPlacesAround;
    var latNeighbour, lngNeighbour, idNeighbour, nameNeighbour, conditions;
    var jsonNeighbourhood, jsonPlacesFilters, circlesArray = [], markerCircle = [];
    var documents = "documents/";
    var pagination = "/limit:10000/count:1";
    var accordionValues, key, count = 0;;
    var bodyAccordion = $("#bodyAccordion");
    var initialPoint, flag; 

    google.maps.event.addListener(map, 'click', function(event){
    //infoWindow.setContent('clicked' + event.latLng.lat()) ;
          jsonNeighbourhood = [];
          jsonPlacesFilters = [];
          
          lat = Math.round((event.latLng.lat()) * 10000)/10000;
          lng = Math.round((event.latLng.lng()) * 10000)/10000;

          //drawing circle at the clicked point
          circleOptions = {
          center: new google.maps.LatLng(lat,lng),
          radius: 80450, //1 mile ~ 1.609 km => 50 miles ~ 80.45km
          map: map
          };

          circle = new google.maps.Circle(circleOptions);

          //removing previous circles if any
          if (circlesArray.length > 0){
              circlesArray[0].setMap(null);
              circlesArray.length = 0;
          }
          circlesArray.push(circle); 

          condPlacesAround =  {"conditions":{
              "latitude": lat,
              "longitude": lng,
              "radius": 50}};

          //getting the neighbourhood points in radius 50 miles from the clicked point
          $.ajax({
              url: url,
              data: condPlacesAround,
              type: 'POST',
              dataType: 'json',
              async: false, //wait for result then continue the code
              success: function(data) {
                  Data = data.data;
                   
                  for(key in Data){
                    if (Data[key].CityDisambiguated.news_score > 1){
                      count++;
                      latNeighbour = Data[key].CityDisambiguated.latitude;
                      lngNeighbour = Data[key].CityDisambiguated.longitude;
                      idNeighbour = Data[key].CityDisambiguated.id;
                      nameNeighbour = Data[key].CityDisambiguated.shortname;
                      jsonNeighbourhood.push({latitude: latNeighbour, longitude:  lngNeighbour, id: idNeighbour, name: nameNeighbour });
                    }
                  }
                 
               },
              error: function(jqXHR, textStatus, errorThrown) {
                  alert('Error:' + textStatus);
              }
          });

           //creating a filter with the Ids of the neighbour places 
           for (i = 0; i < jsonNeighbourhood.length; i++){
           conditions = {"Filter": {"start_date": "-7 days","end_date": "now","conditions": {"and": {"CityDisambiguated": {"id": jsonNeighbourhood[i].id}}}}};
           //conditions = {"Filter": {"start_date": "-7 days","end_date": "now","conditions": {"and": {"CityDisambiguated": jsonPlacesIds}}}};
            $.ajax({
              url: fullUrl,
              data: conditions,
              type: 'POST',
              dataType: 'json',
              async: false, //wait for result then continue the code
              success: function(data) {
                  Data = data.data;
                  jsonPlacesFilters.push({filter: Data.Filter.id, newsCount: Data.Filter.document_count});
               },
              error: function(jqXHR, textStatus, errorThrown) {
                  alert('Error:' + textStatus);
              }
          });
         }

         //removing the previous markers if any
          if (markerCircle.length > 0) {
            for (i in markerCircle) {
              markerCircle[i].setMap(null);
            }
            markerCircle.length = 0;
          }

          var infosArray = [];
         // displaying the markers for the neighbourhood places inthe radius of the clicked point
          for (i = 0; i < jsonNeighbourhood.length; i++){
           // for(j = 0; j < jsonPlacesFilters[i].newsCount; j++){
                initialPoint = new google.maps.LatLng(jsonNeighbourhood[i].latitude,jsonNeighbourhood[i].longitude);
                marker = new google.maps.Marker({
                position: initialPoint,
                map: map   
              });
              markerCircle.push(marker);
              // infoWindow = new google.maps.InfoWindow({
              //       content: String(jsonPlacesFilters[i].newsCount),
              //       position: initialPoint, 
              //   });
              // infosArray.push(infoWindow);
            //}
          }

          var news = 'The news for the last 7 days\n';
          for (i = 0; i < jsonNeighbourhood.length; i++){
            news += jsonNeighbourhood[i].name + " - " + jsonPlacesFilters[i].newsCount + "\n"
          }
          alert(news);


         // alert(Data.length);
              
          var maxNews = 0;
          for (i = 0; i < jsonPlacesFilters.length - 1; i++){
            maxNews = jsonPlacesFilters[0].newsCount;
            for(j = i + 1; j < jsonPlacesFilters.length; j++){
              if (jsonPlacesFilters[j].newsCount > maxNews){
                maxNews = jsonPlacesFilters[j].newsCount;
              }
            }
          }

          for (i = 0; i < jsonPlacesFilters.length; i++){
            if (maxNews == jsonPlacesFilters[i].newsCount){
              urlPool = baseUrl + documents + jsonPlacesFilters[i].filter + pagination + apiKey + extension;
            }
          }
          
          // http://www.semanticwire.com/api/v2.1/documents/4fff5277-8e6c-433a-aee7-19dfc0a8007b/limit:10000/count:1/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b.json

           // news pool
            $.ajax({
              url:urlPool,
              async:false,
              success: function(data){ Data = data.data;},
              dataType:"json"
            });
        
          // $.each(Data, function(index, row) {
          //         row.Document.title = $('<div>' + row.Document.title + '</div>').text();
          //         row.Document.description = $('<div>' + row.Document.description + '</div>').text();
          //   }

          for(i = 0; i < Data.length; i++){
              accordionValues = {
                  article: Data[i].Document.title,
                  articleBody: Data[i].Document.description + "\n <a href='" + Data[i].Document.url + "'>link</a>"
              };
              accordionValues.accItemId = "acc" + i;
              bodyAccordion.append(fillAccordionPageTemplate(accordionValues));
          }

         // Data = {};

    });//end event listener - click
    

  }); //end require
} //end function getClickPoint

// function bindInfo(){

//        for(i = 0; i < infosArray.length; i++){
//           alert("flag 1");
//             google.maps.event.addListener(markerCircle[i], 'click', function() {
//               infosArray[i].open(map);
//             });
//          }     
// }



 function semanticWireAgent(eventName){
  // for (i = 0; i < jsonNewsCount.length; i++){
  //    $('#pageOne').append(jsonNewsCount[i] + " ");
  //  }

    // var newsPool = {
    //     items: [
    //         {title: Data[0].Document.title , description: Data[0].Document.description},
    //         {title: Data[1].Document.title, description: Data[1].Document.description}
    //     ]
    // };
    } //end semanticWireAgent
   
    return {
        semanticWireAgent: semanticWireAgent,
        getClickPoint: getClickPoint
    }

});