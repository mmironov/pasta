 define(["jQuery", "Handlebars", "style", "googleMaps", "MarkerClusterer", "text!templates/pageOne.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, style, googleMaps, MarkerClusterer, pageoneTemplate, accordionPageTemplate) {

    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);

    var apiKey = "/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b";
    var baseUrl = "http://www.semanticwire.com/api/v2.1/";
    var extension = ".json";
    var filterUrl = baseUrl + "filters" + apiKey + extension; 
    var cityDisambiguatedUrl = baseUrl + "library/CityDisambiguated/sort:news_score/direction:desc/limit:20.json";
    var keywordUrl = baseUrl + "library/Tag/limit:1.json";
    var pagination = "/limit:100/count:1";
    var urlPool, infoWindow, keyword, complexConditions;
    var i, j, advSearchData;
    var keywordConditions= {}, dataRadiusFilter = {}, dataComplexFilter = {}, dataKeywordFilter ={}, dataCitiesFilter = {}, dataPoolFilter = {};
    var jsonNeighbourhood =[], jsonPlacesFilters = [], arrayOfCityIds = [];
    var state = 0; //state is for following which menu item is clicked - for example all/technologies/sport and etc
    var pinColor, pinImage, pinShadow, citiesFilterID, accordionValues;
    var circlesArray = [], arrMarkers =[];
    

    //creates the default filter for time (7 days) OR if we have advanced search values, it creates filter for "time" and "keyword"
    //if advanced search is used - the help function findAdvancedSearchIds() is used
    function complexFilterCreation(){
       if ((advSearchData == null) && (state == 0)){
          complexConditions = {"Filter": {"start_date": "-7 days","end_date": "now"}}
        }
        else{
          var conditions = {"and":{}}
          var fromDate, toDate;
          
          if (advSearchData != null){ 
            //example of sophisticated filter {"Filter": {"start_date":"-7 days", "end_date":"now", 
            //"conditions": {"and":{"Tag":{"id":"46922"}, "Topic":[{"id":3}, {"id":8}, {"id":14}]}}}}

            if (advSearchData.keyword != ""){
              findAdvancedSearchIds();
              conditions.and["Tag"] = {};
              conditions.and.Tag["id"] = dataKeywordFilter[0].Tag.id;
            }
           /*to do - people, place*/

            if ((advSearchData.timeFilterFrom != "") && (advSearchData.timeFilterTo != "")){
             
              fromDate = advSearchData.timeFilterFrom;
              toDate = advSearchData.timeFilterTo;
            }

          } //end if (advSearchData != null)

            if ((fromDate == null) && (toDate == null)){
              fromDate = "- 7 days";
              toDate = "now";
            }

          if (state != 0){
            var filterID;
            
            if (state in {"1": 1, "2": 1, "3": 1, "4": 1, "5": 1 }){
              conditions.and["Topic"] = {}
            }

            switch (state) {
              case 1: conditions.and.Topic["id"] = "16"; break;
              case 2: conditions.and.Topic["id"] = "9"; break;
              case 3: conditions.and.Topic["id"] = "2"; break;
              case 4: conditions.and.Topic["id"] = "12"; break;
              case 5: conditions.and.Topic["id"] = "13"; break;
              case 6: conditions.or = {}
              conditions.or["Topic"] = {}
              conditions.or.Topic = [ {"id": 3 }, {"id": 8}, {"id": 14}]; break;
            }
          }

          complexConditions = {"Filter": {"start_date": fromDate,"end_date": toDate, "conditions": conditions }};
          alert(JSON.stringify(complexConditions));
        }

        dataComplexFilter = makeAJAXCall(filterUrl, complexConditions, 'POST', 'complexFilterCreation()');
    }

    //gets the id of the advanced search "keyword"
    //to do - add "people" search
    function findAdvancedSearchIds(){
     
      if (advSearchData.keyword){
        keywordConditions = {"conditions": {"name" : advSearchData.keyword}};
      
        dataKeywordFilter = makeAJAXCall(keywordUrl, keywordConditions, 'POST', 'findAdvancedSearchIds()');
      }
    }

    function distanceBetween2Points(lat1, lng1, lat2, lng2){
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

    //do all the work
    function getClickPoint(eventName){

     //var minNewsScore = 5; //min news score for cities
                
      require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&libraries=drawing&language=en!callback"], function() {

        var googleMapsObjects = googleMaps.drawMap();
        var map = googleMapsObjects[0];
        var drawingManager = googleMapsObjects[1];
        var circleOptions, circle, condPlacesAround;
        var latNeighbour, lngNeighbour, idNeighbour, nameNeighbour, citiesConditions;
        var key, initialPoint, flag;
       

        // console.log(map.getCenter());
        // console.log(map.getMapTypeId());
        // console.log(map.getZoom());
        // console.log(map.getBounds());

        google.maps.event.addListener(map, 'bounds_changed', function() {
          //console.log(map.getBounds());
          invokeAll(map.getCenter(), map);
        });
        

        google.maps.event.addListener(map, 'click', function(event){

         
        });//end event listener - click



        google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
          drawingManager.setOptions({drawingMode: null});

          jsonNeighbourhood = [];
          jsonPlacesFilters = [];
          deleteAllMarkers();
          
          circlesArray.push(circle); 
          var radius = ((circle.getRadius())/1000).toFixed(2); // in km
          console.log("the radius of the circle is " + radius);

          //alert(circle.getCenter().lat() + " " + circle.getCenter().lng());
          makeRadiusCall(radius, circle.getCenter().lat(), circle.getCenter().lng());
          complexFilterCreation();

          citiesFilterID = getCitiesFilterID();
          setMarkersCall(citiesFilterID, map);          

        });

         google.maps.event.addListener(drawingManager, 'drawingmode_changed', function(){
          deleteAllCircles();
          deleteAllMarkers();
        });
      
      }); //end require
    } //end function getClickPoint

    function invokeAll(center, map){

      var citiesFilterID, lat, lng;

      jsonNeighbourhood = [];
      jsonPlacesFilters = [];

      deleteAllMarkers();
      deleteAllCircles();
    
      //to do - better approximation than that
      var screenRadius = distanceBetween2Points(map.getCenter().lat(), map.getCenter().lng(), map.getBounds().getNorthEast().lat(), map.getBounds().getNorthEast().lng());

      map.panTo(center);
      lat = Math.round((center.lat()) * 10000)/10000;
      lng = Math.round((center.lng()) * 10000)/10000;

      makeRadiusCall(screenRadius, lat, lng);

      //for testing
      var help = '';
      for (i in arrayOfCityIds){
        help = help + arrayOfCityIds[i] + ",";
      }
      console.log(help);

      complexFilterCreation();
      citiesFilterID = getCitiesFilterID();
      setMarkersCall(citiesFilterID, map);
      fetchNews(citiesFilterID);
    }

    function makeRadiusCall(radius, latitude, longitude){
       condPlacesAround =  {"conditions":{
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius*0.62 //turing from km to miles
            //"min_news_score": minNewsScore
            }};

        console.log('radius (km)' + radius + "radius (miles)" + radius*0.62);

        arrayOfCityIds = []; 

        //getting the neighbourhood points in radius 50 miles from the clicked point
        dataRadiusFilter = makeAJAXCall(cityDisambiguatedUrl, condPlacesAround, "POST", dataRadiusFilter, "radius call");
          for(key in dataRadiusFilter){
            latNeighbour = dataRadiusFilter[key].CityDisambiguated.latitude;
            lngNeighbour = dataRadiusFilter[key].CityDisambiguated.longitude;
            idNeighbour = dataRadiusFilter[key].CityDisambiguated.id;
            nameNeighbour = dataRadiusFilter[key].CityDisambiguated.shortname;
            jsonNeighbourhood.push({latitude: latNeighbour, longitude:  lngNeighbour, id: idNeighbour, name: nameNeighbour });
            arrayOfCityIds.push(idNeighbour);
          }
    }

    //creating a filter with the Ids of the neighbour places 
    function getCitiesFilterID(){
        citiesConditions = {"Filter": {"parent_id": [dataComplexFilter.Filter.id] ,"conditions": {"or": {"CityDisambiguated": {"id": arrayOfCityIds}}}}};
        dataCitiesFilter = makeAJAXCall(filterUrl, citiesConditions, "POST", "get cities filter id");
        return dataCitiesFilter.Filter.id;
    }

    function setMarkersCall(citiesFilterID, map){
     require([ "libs/MarkerWithLabel/MarkerWithLabel.js"], function(){

      pinColor = style.getMenuColors()[state].replace("#","");;
      pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));
      pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
      new google.maps.Size(40, 37),
      new google.maps.Point(0, 0),
      new google.maps.Point(12, 35));

      var statisticsUrl = baseUrl + "statistics/CityDisambiguated/" + citiesFilterID + extension;
      var statisticsConditions = {"conditions": { "id": arrayOfCityIds }};
      dataCitiesFilter = makeAJAXCall(statisticsUrl, statisticsConditions, "POST", "get cities filter id");

      //to do: refactoring 
        for (i = 0; i < jsonNeighbourhood.length; i++){
          for(j = 0; j < dataCitiesFilter.length; j++){
            if (jsonNeighbourhood[i].id == dataCitiesFilter[j].CityDisambiguated.id) {
              jsonPlacesFilters.push({name: dataCitiesFilter[j].CityDisambiguated.name, 
                id: dataCitiesFilter[j].CityDisambiguated.id, 
                newsScore: dataCitiesFilter[j].CityDisambiguated.news_score, 
                newsCount: dataCitiesFilter[j].CityDisambiguated.document_count});      
            }
          }
        }

        //removing the previous markers if any
        deleteAllMarkers();

        // displaying the markers for the neighbourhood places in the radius of the clicked point
       
        for (i = 0; i < jsonNeighbourhood.length; i++){
          if (jsonPlacesFilters[i].newsCount > 0){
             var marker = new MarkerWithLabel({
             position: new google.maps.LatLng(jsonNeighbourhood[i].latitude,jsonNeighbourhood[i].longitude),
             map: map,
             icon: pinImage,
             shadow: pinShadow,
            // labelAnchor: new google.maps.Point(20, 0),
             labelClass: "labels", // the CSS class for the label
             labelStyle: {opacity: 0.75},
             labelContent: jsonPlacesFilters[i].newsCount
            });
            arrMarkers.push(marker);
          }
        }
    
     });

    }

    function fetchNews(citiesFilterID){
      var bodyAccordion = $("#bodyAccordion");
       urlPool = baseUrl + "documents/" + citiesFilterID + pagination + apiKey + extension;
          $.ajax({
                url:urlPool,
                async:false,
                success: function(data){ dataPoolFilter = data.data;},
                dataType:"json"
              });
       console.log(dataPoolFilter[0].Document.description);
    

            // console.log(Data[0].Document.description);
            for(i = 0; i < dataPoolFilter.length; i++){
                accordionValues = {
                    article: dataPoolFilter[i].Document.title,
                    articleBody: dataPoolFilter[i].Document.description.replace(/<(SPAN|IMG|A|BR|P|H1|H­ 2){1}.*>/i,'') ,
                    url: dataPoolFilter[i].Document.url
                };
                accordionValues.accItemId = "acc" + i;
                bodyAccordion.append(fillAccordionPageTemplate(accordionValues));
            }
    }

    function deleteAllMarkers(){
      if (arrMarkers.length > 0) {
        for (i in arrMarkers) {
          arrMarkers[i].setMap(null);
        }
        arrMarkers.length = 0;
      }
    }

    function deleteAllCircles(){
     if (circlesArray.length > 0){
            circlesArray[0].setMap(null);
            circlesArray.length = 0;
        }
    }

    //miscellaneous - connects "pageOne" module with this one
    function semanticWireAgent(eventName){
          
      $("#linksContainer a").bind("click", function(){
        state = $("#linksContainer a").index(this);
        console.log(state);})

      $("#advancedSearch1").bind('click', loadPopupBox);
      $('#popupBoxClose').click( function() {         
          advSearchData = unloadPopupBox();
      });
    } //end semanticWireAgent

    
    function makeAJAXCall(fullURL, dataConditions, type, errorMessage){
      var tempData = {};
      $.ajax({
        url: fullURL,
        data: dataConditions,
        type: type,
        dataType: 'json',
        async: false, //wait for result then continue the code
        success: function(data) {
            tempData = data.data;
         },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error:' + errorMessage + textStatus);
        }
      });

      return tempData;
    }
   
    //TO Unload the Popupbox for advanced search
    function unloadPopupBox(eventName) { 
        $('#popup_box').fadeOut("slow");
        $("#map").css({ // this is just for style     
            "opacity": "1"  
        }); 
        advSearchValues = {
        keyword : $("input[name=keyword]").val(),
        timeFilterFrom : $("input[name=timeFrom]").val(),
        timeFilterTo : $("input[name=timeTo]").val(),
        place : $("input[name=place]").val(),
        people : $("input[name=people]").val()
        };
        //$(document).trigger('advanced_search', [advSearchValues]);
       return advSearchValues;
    }
  
    //To Load the Popupbox for advanced search
    function loadPopupBox() {   
        $('#popup_box').fadeIn("slow");
        $("#map").css({ // this is just for style
            "opacity": "0.3"  
        });         
    }

    return {
        semanticWireAgent: semanticWireAgent,
        getClickPoint: getClickPoint
}

});