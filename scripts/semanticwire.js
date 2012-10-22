 define(["jQuery", "Handlebars", "style", "googleMaps", "text!templates/pageOne.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, style, googleMaps, pageoneTemplate, accordionPageTemplate) {

    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);
    var fillTemplate = Handlebars.compile(pageoneTemplate);

    var apiKey = "/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b";
    var baseUrl = "http://www.semanticwire.com/api/v2.1/";
    var extension = ".json";
    var filterUrl = baseUrl + "filters" + apiKey + extension; 
    var cityDisambiguatedUrl = baseUrl + "library/CityDisambiguated/sort:news_score/direction:desc/limit:20" + apiKey + extension;
    var pagination = "/limit:100/count:1";
    var urlPool, infoWindow, keyword, complexConditions, center, noDataAlertIsActive, polygon;
    var i, j, advSearchData, opacity = 1;
    var advSearchConditions= {}, dataRadiusFilter = {}, dataComplexFilter = {}, dataKeywordFilter ={}, dataCitiesFilter = {}, dataPoolFilter = {};
    var jsonNeighbourhood =[], jsonPlacesFilters = [], arrayOfCityIds = [], arrayOfCityIdsLong =[], polyArr = [];
    var state = 0; //state is for following which menu item is clicked - for example all/technologies/sport and etc
    var pinColor, pinImage, pinShadow, citiesFilterID, accordionValues, timeRangeValues = {};
    var circlesArray = [], arrMarkers =[];

    //do all the work
    function semanticWireAgent(eventName){

      setSlider();
                
      require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&libraries=drawing,geometry&language=en!callback"], function() {

        var googleMapsObjects = googleMaps.drawMap();
        var map = googleMapsObjects[0];
        var drawingManager = googleMapsObjects[1];
        var canvasProjectionOverlay = googleMapsObjects[2];
        var circleOptions, circle, condPlacesAround;
        var latNeighbour, lngNeighbour, idNeighbour, nameNeighbour, citiesConditions;
        var key, initialPoint, flag, circleDrawnBool, circleDrawn;
       
        // console.log(map.getCenter());
        // console.log(map.getMapTypeId());
        // console.log(map.getZoom());
        // console.log(map.getBounds());

        google.maps.event.addListenerOnce(map, 'idle', function(){
          invokeAll(map);
       });

      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');
      canvas.addEventListener('mouseup', ev_mouseup, false);

      function ev_mouseup(ev){
         drawingPoly();
      } //end mouse up event
      
      function drawingPoly(){
        var googleObjectsDraw = googleMaps.returnCircle();
        var circle = googleObjectsDraw[0];
        polygon = googleObjectsDraw[1];
        polyArr.push(polygon);

        jsonNeighbourhood = [];
        jsonPlacesFilters = [];
        deleteAllMarkers();

        callCircleNews(circle, circle.getRadius(), circle.getCenter().lat(), circle.getCenter().lng()); 

        //we have to filter all the cities that are outside the drawn area
        var toDelete = [];
        for(i = 0; i < jsonNeighbourhood.length; i++){
          var point = new google.maps.LatLng(jsonNeighbourhood[i].latitude, jsonNeighbourhood[i].longitude);
          if (!google.maps.geometry.poly.containsLocation(point, polygon)) {
            toDelete.push(i);
          }
        }
      
        for (i = toDelete.length-1; i >= 0; i--){
          jsonNeighbourhood.splice(toDelete[i],1);
        }
       
        arrayOfCityIds = [];
        for(i = 0; i < jsonNeighbourhood.length; i++){
          arrayOfCityIds.push(jsonNeighbourhood[i].id);
        }

        citiesFilterID = getCitiesFilterID();
        setMarkers(citiesFilterID, map);
        fetchNews(citiesFilterID);   
      }

       $('#linksContainer  [id^="category"]').on("click", function(){
          if (circleDrawnBool) {
            callCircleNews(circleDrawn, circleDrawn.getRadius(), circleDrawn.getCenter().lat(), circleDrawn.getCenter().lng());
            citiesFilterID = getCitiesFilterID();
            setMarkers(citiesFilterID, map);
            fetchNews(citiesFilterID);
          }
          if (typeof(polyArr[0]) === 'undefined' && !circleDrawnBool){
            invokeAll(map);
          }
          if (typeof(polyArr[0]) !== 'undefined'){
            drawingPoly();
          }
        });

        $('#buttonWrap button').click( function() {         
          advSearchData = unloadPopupBox();
          invokeAll(map);
        });
    
        $("#drawMode").bind("click", drawModeEvent);
        $("#drawModeClear").bind("click", function(){
          $(this).css("display","none");
          drawModeEvent();
          invokeAll(map);
        });

        function drawModeEvent(){
          if (typeof(polyArr[0]) !== 'undefined') {
            polygon.setMap(null);
            deleteAllMarkers();
            deleteAllCircles();
            deleteNews();
          }
          else{
            deleteAllMarkers();
            deleteAllCircles();
            deleteNews();
          }
        }
  
        google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
          drawingManager.setOptions({drawingMode: null});

          circleDrawn = circle;
          circleDrawnBool = true;
          callCircleNews(circleDrawn, circleDrawn.getRadius(), circleDrawn.getCenter().lat(), circleDrawn.getCenter().lng());
          citiesFilterID = getCitiesFilterID();
          setMarkers(citiesFilterID, map);
          fetchNews(citiesFilterID);
        });

        google.maps.event.addListener(drawingManager, 'drawingmode_changed', function(){
          deletePolygon();
          deleteAllCircles();
          deleteAllMarkers();
        });

      }); //end require
    } //end function semanticWireAgent

    function invokeAll(map){
      var citiesFilterID, lat, lng;
      noDataAlertIsActive = false;
      center = map.getCenter();

      jsonNeighbourhood = [];
      jsonPlacesFilters = [];

      deleteAllMarkers();
      deleteAllCircles();
    
      complexFilterCreation(map);

      //to do - better approximation than that
      var screenRadius = googleMaps.distanceBetween2Points(map.getCenter().lat(), map.getCenter().lng(), map.getBounds().getNorthEast().lat(), map.getBounds().getNorthEast().lng());
       
      map.panTo(center);
      lat = Math.round((center.lat()) * 10000)/10000;
      lng = Math.round((center.lng()) * 10000)/10000;

      if (dataComplexFilter){
        makeRadiusCall(screenRadius, lat, lng);

        //for testing
        var help = '';
        for (i in arrayOfCityIds){help = help + arrayOfCityIds[i] + ",";}console.log("ids of the cities" + help);
   
        citiesFilterID = getCitiesFilterID();
        setMarkers(citiesFilterID, map);
        fetchNews(citiesFilterID);
      }
      else{
        noDataAlert();
        deletePolygon();
        deleteAllCircles();
      }
    }

//_____________________________
//main functionality functions:
//*****************************

    //creates the default filter for time (7 days by def) OR if we have advanced search values, it creates filter for "time" and "keyword"\
    function complexFilterCreation(map){

      noDataAlertIsActive = false;

      if ((advSearchData == null) && (state == 0)){
        complexConditions = {"Filter": {"start_date": "-7 days","end_date": "now"}}
      }
      else{
        var conditions = {"and":{}}
        var fromDate, toDate, noData = false;
        
        if (advSearchData != null){ 
          //example of sophisticated filter {"Filter": {"start_date":"-7 days", "end_date":"now", 
          //"conditions": {"and":{"Tag":{"id":"46922"}, "Topic":[{"id":3}, {"id":8}, {"id":14}]}}}}

          if ((advSearchData.timeFilterFrom != "") && (advSearchData.timeFilterTo != "")){ 
            fromDate = advSearchData.timeFilterFrom;
            toDate = advSearchData.timeFilterTo;
          }

          var advSearchType = ["Tag", "PersonDisambiguated", "CityDisambiguated"];

          if (advSearchData.keyword != ""){
            findAdvancedSearchIds(advSearchType[0], advSearchData.keyword);
            if (dataKeywordFilter[0]){
              conditions.and["Tag"] = {};
              conditions.and.Tag["id"] = dataKeywordFilter[0].Tag.id;
            }
            else{
              noData = true;
            }
          }

          if (advSearchData.place != ""){
            
            findAdvancedSearchIds(advSearchType[2], advSearchData.place + "%");
            if (dataKeywordFilter[0]){
              center = new google.maps.LatLng(dataKeywordFilter[0].CityDisambiguated.latitude, dataKeywordFilter[0].CityDisambiguated.longitude);
              map.setCenter(center);
              map.panTo(center);
              conditions.and["CityDisambiguated"] = {};
              conditions.and.CityDisambiguated["id"] = dataKeywordFilter[0].CityDisambiguated.id;
            }
            else{
              noData = true;
            }
            
          }

          if (advSearchData.people != ""){
            findAdvancedSearchIds(advSearchType[1], advSearchData.people);
            if (dataKeywordFilter[0]){
              conditions.and["PersonDisambiguated"] = {};
              conditions.and.PersonDisambiguated["id"] = dataKeywordFilter[0].PersonDisambiguated.id;
            }
            else
            {
              noData = true;
            }
          }
        } //end if (advSearchData != null)

        if ((fromDate == null) && (toDate == null)){
            fromDate = "- 7 days";
            toDate = "now";
        }

        if (state != 0){ //state is the chosen menu item - all, sport, fun etc.
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
            conditions.or.Topic = [{"id": 3 }, {"id": 8}, {"id": 14}]; break;
          }
        }

        complexConditions = {"Filter": {"start_date": fromDate,"end_date": toDate, "conditions": conditions }};
        console.log("complex conditions" + JSON.stringify(complexConditions));
      }

      if (noData){
        dataComplexFilter = null;
      }
      else{
        dataComplexFilter = makeAJAXCall(filterUrl, complexConditions, 'POST', 'complexFilterCreation()');
      } 
    }

    //gets the id of the advanced search "keyword", "people" or "place"
    function findAdvancedSearchIds(advSearchType, advSearchString){
      var advancedSearchUrl = baseUrl + "library/" + advSearchType + "/limit:1.json";

      advSearchConditions = {"conditions": {"name" : advSearchString}};
      console.log(JSON.stringify(advSearchConditions));
      dataKeywordFilter = makeAJAXCall(advancedSearchUrl, advSearchConditions, 'POST', 'findAdvancedSearchIds()');
    }

    function makeRadiusCall(radius, latitude, longitude){
       condPlacesAround =  {"conditions":{
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius*0.62, //turing from km to miles
            }};

        console.log('radius (km)' + radius + "radius (miles)" + radius*0.62);

        arrayOfCityIds = []; 
        arrayOfCityIdsLong = [];

        //getting the neighbourhood points in radius 50 miles from the clicked point
        dataRadiusFilter = makeAJAXCall(cityDisambiguatedUrl, condPlacesAround, "POST", dataRadiusFilter, "radius call");
          for(key in dataRadiusFilter){
            latNeighbour = dataRadiusFilter[key].CityDisambiguated.latitude;
            lngNeighbour = dataRadiusFilter[key].CityDisambiguated.longitude;
            idNeighbour = dataRadiusFilter[key].CityDisambiguated.id;
            nameNeighbour = dataRadiusFilter[key].CityDisambiguated.shortname;
            jsonNeighbourhood.push({latitude: latNeighbour, longitude:  lngNeighbour, id: idNeighbour, name: nameNeighbour });
            arrayOfCityIds.push(idNeighbour);
            arrayOfCityIdsLong.push({"id": idNeighbour, "min_relevance" : 25});
          }

          if (arrayOfCityIds.length == 0 && noDataAlertIsActive == false){
            noDataAlert();
            deletePolygon();
            deleteAllCircles();
            console.log("2");
          }
          console.log("number of cities" + arrayOfCityIds.length);
    }

    //creating a filter with the Ids of the neighbour places 
    function getCitiesFilterID(){
        citiesConditions = {"Filter": {"parent_id": [dataComplexFilter.Filter.id] ,"conditions": {"or": {"CityDisambiguated":arrayOfCityIdsLong}}}};
        dataCitiesFilter = makeAJAXCall(filterUrl, citiesConditions, "POST", "get cities filter id");
        console.log(JSON.stringify(citiesConditions));
        return dataCitiesFilter.Filter.id;
    }

    function setMarkers(citiesFilterID, map){
     require(["libs/MarkerWithLabel/MarkerWithLabel.js"], function(){

      pinColor = style.getMenuColors()[state].replace("#","");;
      pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));
      pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
      new google.maps.Size(40, 37),
      new google.maps.Point(0, 0),
      new google.maps.Point(12, 35));

      var statisticsUrl = baseUrl + "statistics/CityDisambiguated/" + citiesFilterID + apiKey + extension;
      var statisticsConditions = {"conditions": { "id": arrayOfCityIds }};
      dataCitiesFilter = makeAJAXCall(statisticsUrl, statisticsConditions, "POST", "get cities filter id");

      console.log(JSON.stringify(statisticsConditions));
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

        deleteAllMarkers();

        // displaying the markers for the neighbourhood places in the radius of the clicked point 
        var numberOfMarkers = 0;
        for (i = 0; i < jsonNeighbourhood.length; i++){
          if (jsonPlacesFilters[i].newsCount > 0){
             var marker = new MarkerWithLabel({
             position: new google.maps.LatLng(jsonNeighbourhood[i].latitude,jsonNeighbourhood[i].longitude),
             map: map,
             icon: pinImage,
             shadow: pinShadow,
            // labelAnchor: new google.maps.Point(20, 0),
             labelClass: "labels", // the CSS class for the label
             labelStyle: {opacity: 1},
             labelContent: jsonPlacesFilters[i].newsCount
            });
            arrMarkers.push(marker);
            numberOfMarkers++;
          }
        }

        console.log("number of markers " + numberOfMarkers);
         
        if (numberOfMarkers == 0 && noDataAlertIsActive == false){
          noDataAlert();
          deletePolygon();
          deleteAllCircles();
        }
    
     });
    }

    function fetchNews(citiesFilterID){
      var bodyAccordion = $("#bodyAccordion");
      var countNews;
      urlPool = baseUrl + "document_groups/" + citiesFilterID + pagination + apiKey + extension;
      deleteNews();

      $.ajax({
            url:urlPool,
            async:false,
            success: function(data){ dataPoolFilter = data.data; countNews = data.pagination.count},
            dataType:"json"
          });
  
      if (countNews >= 49){
        $('.panel h6').html("49 of " + countNews);
      }
      else{
         $('.panel h6').html(countNews + " of " + countNews);
      }
      
      //document_groups //taking only the first page
      for(i = 0; i < dataPoolFilter.length; i++){
        if (typeof(dataPoolFilter[i].Related) !== 'undefined'){
            accordionValues = {
              article: dataPoolFilter[i].Related[0].Document.title,
              articleBody: dataPoolFilter[i].Related[0].Document.description.replace(/<(SPAN|IMG|A|BR|P|H1|H­ 2){1}.*>/i,''), //to do - regular expression for hash symbols to be included
              url: dataPoolFilter[i].Related[0].Document.url
            };
            accordionValues.accItemId = "acc" + i;
            bodyAccordion.append(fillAccordionPageTemplate(accordionValues));
          }
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
            circleDrawnBool = false;
        }
    }

    function deletePolygon(){
      if (typeof( polyArr[0]) !== 'undefined') {
        polygon.setMap(null);
        polyArr = [];
      }
    }

    function deleteNews(){
      $("#bodyAccordion").children("a").remove();
      $(".panel h6").html("");
    }

    function callCircleNews(circle, radiusM, centerLat, centerLng){
      jsonNeighbourhood = [];
      jsonPlacesFilters = [];
      deleteAllMarkers();
      
      circlesArray.push(circle); 
      var radius = (radiusM/1000).toFixed(2); // in km
      console.log("the radius of the circle is " + radius);

      complexFilterCreation();
      makeRadiusCall(radius, centerLat, centerLng);
    }

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

//_______________________
//visualization functions
//***********************

    function noDataAlert(){
      $('#noDataMessage').fadeIn("slow"); 
      toggleAppOpacity();
      noDataAlertIsActive = true
      $("#drawModeClear").css("display", "none");
    }

    function unloadPopupBox(eventName) { 
        console.log("unload call");
        $('#popup_box').fadeOut("slow");
        toggleAppOpacity();
        advSearchValues = {
          keyword : $("input[name=keyword]").val(),
          timeFilterFrom : timeRangeValues.privateValues[$("#slider").slider("values", 0)-1],
          timeFilterTo : timeRangeValues.privateValues[$("#slider").slider("values", 1)-1],
          place : $("input[name=place]").val(),
          people : $("input[name=people]").val()
        };
      
        //$(document).trigger('advanced_search', [advSearchValues]);
       return advSearchValues;
    }
  
    //To load the Popupbox for advanced search
    function loadPopupBox() {   
        $('#popup_box').fadeIn("slow");
        toggleAppOpacity();
    }

    //fading out the  opacity - just for visualization - it's not blocking the application
    //to do - block functionality
    function toggleAppOpacity(){
      //not working -> $("#map").toggle(function(){$(this).css({"opacity": "0.3"});}, function(){$(this).css({"opacity": "1"});});        
      if (opacity == 1){
        $("#map").css({"opacity": "0.3"});         
        $("header").css({"opacity": "0.3"});
        $("#accordion").css({"opacity": "0.3"});
        opacity = 0.3;
      }
      else
      {
        $("#map").css({"opacity": "1"});         
        $("header").css({"opacity": "1"});
        $("#accordion").css({"opacity": "1"});
        opacity = 1;
      }
    }

    function setSlider(){
       require([ "scripts/assets/jquery-ui-1.8.23.custom.min.js"], function(){
         timeRangeValues = {publicValues: ["1 month ago", "2 weeks ago", "1 week ago", "yesterday", "now"], privateValues: ["-1 month", "-2 weeks", "-7 days", "-1 day", "now"]};

          $( "#slider" ).slider({
            range: true,
            min: 1,
            max: 5,
            values: [3, 5],
            slide: function( event, ui ) {
              $( "#amount" ).val( timeRangeValues.publicValues[ui.values[ 0 ] -1] + " - " + timeRangeValues.publicValues[ui.values[ 1 ] -1]);
            }
          });
         
          $( "#amount" ).val( timeRangeValues.publicValues[$("#slider").slider("values", 0)-1] + 
            " - " + timeRangeValues.publicValues[$("#slider").slider( "values", 1 )-1] );
        });
    }

    //called only once!
    function visualizationAgent(eventName){

      $('#linksContainer [id^="category"]').bind("click", function(){
        state = $("#linksContainer a").index(this);
        console.log(state);});

      $("#advancedSearch").bind('click', loadPopupBox);

      $("#popupBoxClose").bind('click', function(){ 
        $('#popup_box').fadeOut("slow");
        toggleAppOpacity();
      });

      $("#noDataMessage button").on("click",function(){
        toggleAppOpacity();
        $("#noDataMessage").fadeOut("slow");
      });
    } //end visualizationAgent

    return {
        visualizationAgent: visualizationAgent,
        semanticWireAgent: semanticWireAgent
    }

});