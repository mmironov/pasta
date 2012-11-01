 //contains semantic wire and google maps manipulation functionality
 define(["jQuery", "Handlebars", "style", "config", "googleMaps", "text!templates/content.html", "text!templates/accordionPage.html"], 
  function($, Handlebars, style, config, googleMaps, contentTemplate, accordionPageTemplate) {

    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);
    //var fillTemplate = Handlebars.compile(contentTemplate);
    
    var apiKey = "/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b";
    var baseUrl = "http://www.semanticwire.com/api/v2.1/";
    var extension = ".json";
    var filterUrl = baseUrl + "filters" + apiKey + extension; 
    var cityDisambiguatedUrl = baseUrl + "library/CityDisambiguated/sort:news_score/direction:desc/limit:20" + apiKey + extension;
    var pagination = "/limit:100/count:1";
    var urlPool, infoWindow, keyword, complexConditions, center, noDataAlertIsActive, polygon, map;
    var i, j, advSearchData, placeSearch = false;
    var advSearchConditions= {}, dataRadiusFilter = {}, dataComplexFilter = {}, dataKeywordFilter ={}, dataCitiesFilter = {}, dataPoolFilter = {};
    var jsonNeighbourhood =[], jsonPlacesFilters = [], arrayOfCityIds = [], arrayOfCityIdsLong =[], polyArr = [];
    var state = 0; //state is for following which menu item is clicked - for example all/technologies/sport and etc
    var pinColor, pinImage, pinShadow, citiesFilterID, accordionValues;
    var circlesArray = [], arrMarkers =[];

    //do all the work
    function semanticWireAgent(eventName){

      config.setSlider();
      flip();          

      require(["async!https://maps.googleapis.com/maps/api/js?key=AIzaSyANyAHxLy9SALbItIwwTwIP3IXRw3J5efc&sensor=true&libraries=drawing,geometry&language=en!callback"], function() {

        var googleMapsObjects = googleMaps.drawMap();
        map = googleMapsObjects[0];
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
          invokeAll();
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

          map.setCenter(circle.getCenter());
          map.panTo(circle.getCenter());

          jsonNeighbourhood = [];
          jsonPlacesFilters = [];
          deleteAllMarkers();

          callCircleNews(map, circle, circle.getRadius(), circle.getCenter().lat(), circle.getCenter().lng()); 

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
         
          arrayOfCityIds = []; arrayOfCityIdsLong = [];
          for(i = 0; i < jsonNeighbourhood.length; i++){
            arrayOfCityIds.push(jsonNeighbourhood[i].id);
            arrayOfCityIdsLong.push({"id": jsonNeighbourhood[i].id, "min_relevance" : 25});
          }

          citiesFilterID = getCitiesFilterID();
          setMarkers(citiesFilterID, map);
          fetchNews(citiesFilterID);   
        } //end drawingPoly()

        $('#linksContainer [id^="category"]').on("click", function(){
          if (circleDrawnBool) {
            console.log("cl1");
            callCircleNews(map, circleDrawn, circleDrawn.getRadius(), circleDrawn.getCenter().lat(), circleDrawn.getCenter().lng());
            citiesFilterID = getCitiesFilterID();
            setMarkers(citiesFilterID, map);
            fetchNews(citiesFilterID);
          }
          if (typeof(polyArr[0]) === 'undefined' && !circleDrawnBool){
            console.log("cl2");
            invokeAll();
          }
          if (typeof(polyArr[0]) !== 'undefined'){
            console.log("cl3");
            drawingPoly();
          }
        });

        $('#buttonWrap button').click( function() {   
          $('#popup_box').fadeOut("slow");
          advSearchData = config.unloadPopupBox();
          invokeAll();
        });
    
        $("#drawMode").bind("click", drawModeEvent);
        $("#drawModeClear").bind("click", function(){
          $(this).css("display","none");
          drawModeEvent();
          //invokeAll();
        });

        function drawModeEvent(){
          if (typeof(polyArr[0]) !== 'undefined') {
            //polygon.setMap(null);
            deletePolygon();
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
          map.setCenter(circleDrawn.getCenter());
          map.panTo(circleDrawn.getCenter());          
          circleDrawnBool = true;
          callCircleNews(map, circleDrawn, circleDrawn.getRadius(), circleDrawn.getCenter().lat(), circleDrawn.getCenter().lng());
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

    function invokeAll(){
      var citiesFilterID, lat, lng;
      noDataAlertIsActive = false;
      center = map.getCenter();

      jsonNeighbourhood = [];
      jsonPlacesFilters = [];

      deleteAllMarkers();
      //deleteAllCircles();
    
      complexFilterCreation();

      //to do - better approximation than that
      var screenRadius = googleMaps.distanceBetween2Points(map.getCenter().lat(), map.getCenter().lng(), map.getBounds().getNorthEast().lat(), map.getBounds().getNorthEast().lng());
       
      map.panTo(center);
      lat = Math.round((center.lat()) * 10000)/10000;
      lng = Math.round((center.lng()) * 10000)/10000;

      if (dataComplexFilter){
        if (!placeSearch) {
          makeRadiusCall(screenRadius, lat, lng);

          //for testing
          var help = '';
          for (i in arrayOfCityIds){help = help + arrayOfCityIds[i] + ",";}console.log("ids of the cities" + help);
     
          citiesFilterID = getCitiesFilterID();
          setMarkers(citiesFilterID, map);
          fetchNews(citiesFilterID);
        }
        else{
          arrayOfCityIds = [dataKeywordFilter[0].CityDisambiguated.id];
          setMarkers(dataComplexFilter.Filter.id, map);
          fetchNews(dataComplexFilter.Filter.id);
        }
      }
      else{
        noDataAlert();
      }
    }

//_____________________________
//main functions:
//*****************************

    //creates the default filter for time (7 days by def) OR if we have advanced search values, it creates filter for "time" and "keyword"\
    function complexFilterCreation(){
      var  startDate, endDate;

      config.config();
      //checking configuration options (if set by the user) first
      if (window.localStorage.getItem("configValues")){
        configValues = JSON.parse(window.localStorage.getItem("configValues"));
        startDate = configValues.timeRange.from;
        endDate = configValues.timeRange.to;
        console.log("start " + startDate + " end " + endDate);
      }
      else{
        startDate = "-7 days";
        endDate = "now";
      }

      noDataAlertIsActive = false;

      if ((advSearchData == null) && (state == 0)){
        complexConditions = {"Filter": {"start_date": startDate,"end_date": endDate}}
      }
      else{
        var conditions = {"and":{}}
        var noData = false;
        
        if (advSearchData != null){ 
          //example of sophisticated filter {"Filter": {"start_date":"-7 days", "end_date":"now", 
          //"conditions": {"and":{"Tag":{"id":"46922"}, "Topic":[{"id":3}, {"id":8}, {"id":14}]}}}}

          if ((advSearchData.timeFilterFrom != "") && (advSearchData.timeFilterTo != "")){ 
            startDate = advSearchData.timeFilterFrom;
            endDate = advSearchData.timeFilterTo;
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
              placeSearch = true;
              center = new google.maps.LatLng(dataKeywordFilter[0].CityDisambiguated.latitude, dataKeywordFilter[0].CityDisambiguated.longitude);
              console.log(center);
              map.setCenter(center);
              map.panTo(center);
              conditions.and["CityDisambiguated"] = {};
              conditions.and.CityDisambiguated["id"] = dataKeywordFilter[0].CityDisambiguated.id;
              jsonNeighbourhood.push({latitude: dataKeywordFilter[0].CityDisambiguated.latitude, longitude: dataKeywordFilter[0].CityDisambiguated.longitude, id: dataKeywordFilter[0].CityDisambiguated.id, name: dataKeywordFilter[0].CityDisambiguated.name });
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

        complexConditions = {"Filter": {"start_date": startDate,"end_date": endDate, "conditions": conditions }};
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

      pinColor = style.getMenuColors()[state].replace("#","");
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
                newsCount: parseInt(dataCitiesFilter[j].CityDisambiguated.document_count)});      
            }
          }
        }

        deleteAllMarkers();

        // for (i = 0; i < jsonPlacesFilters.length; i++){
        //   console.log(jsonPlacesFilters[i].newsCount + "\n");
        // }

      var totalNews = 0;

      for (i = 0; i < jsonPlacesFilters.length; i++){
        totalNews += jsonPlacesFilters[i].newsCount;
      }

      var newsPercent;
      for (i = 0; i < jsonPlacesFilters.length; i++){
        newsPercent = jsonPlacesFilters[i].newsCount*100/totalNews;
        jsonPlacesFilters[i]["newsPercent"]  = Math.ceil(newsPercent).toFixed(0);
      }

        // displaying the markers for the neighbourhood places in the radius of the clicked point 
        var numberOfMarkers = 0;
        for (i = 0; i < jsonNeighbourhood.length; i++){
          if (jsonPlacesFilters[i].newsCount > 0){
            var marker = new MarkerWithLabel({
              position: new google.maps.LatLng(jsonNeighbourhood[i].latitude,jsonNeighbourhood[i].longitude),
              map: map,
              icon: pinImage,
              shadow: pinShadow,
              labelAnchor: new google.maps.Point(20, 0),
              labelClass: "labels", // the CSS class for the label
              labelStyle: {opacity: 1},
              labelContent: jsonPlacesFilters[i].newsPercent + "%"
            });
            arrMarkers.push(marker);

            // //circular markers
            // var circle = new google.maps.Circle({
            //   map: map,
            //   radius: 5000 + (30000*jsonPlacesFilters[i].newsPercent)/100,    // metres
            //   fillColor: '#000000', //'#00c42f',
            //   fillOpacity: 0.5,
            //   strokeWeight: 0,
            //   strokecolor: "#000000"
            // });
            // circle.bindTo('center', marker, 'position');

            numberOfMarkers++;
          }
        }

        console.log("number of markers " + numberOfMarkers);
         
        if (numberOfMarkers == 0 && noDataAlertIsActive == false){
          noDataAlert();
        }
     }); //end require
    }

    function fetchNews(citiesFilterID){
      var bodyAccordion = $("#bodyAccordion");
      var countNews, current;
      urlPool = baseUrl + "document_groups/" + citiesFilterID + pagination + apiKey + extension;
      deleteNews();

      $.ajax({
        url:urlPool,
        async:false,
        success: function(data){ dataPoolFilter = data.data; countNews = data.pagination.count; current = data.pagination.current},
        dataType:"json"
      });

      console.log(dataPoolFilter.length);
  
      var toRemoveEmptyNews = [];
      
      for (i = 0; i < dataPoolFilter.length; i++){
        if ($('<div>' + dataPoolFilter[i].Related[0].Document.description + '</div>').text() == ""){
          toRemoveEmptyNews.push(i);
        }
      }

      for (i = toRemoveEmptyNews.length -1; i >= 0; i--){
        dataPoolFilter.splice(toRemoveEmptyNews[i],1);
      }

      countNews = countNews - toRemoveEmptyNews.length;
      current = current - toRemoveEmptyNews.length;

      if (countNews >= 49){
        $('.panel h6').html("49 of " + countNews);
      }
      else{
         $('.panel h6').html(current + " of " + current);
      }
      
      //document_groups //taking only the first page
      for(i = 0; i < dataPoolFilter.length; i++){
        if (typeof(dataPoolFilter[i].Related) !== 'undefined'){
            accordionValues = {
              article:  $('<div>' + dataPoolFilter[i].Related[0].Document.title + '</div>').text(),
              //articleBody: dataPoolFilter[i].Related[0].Document.description.replace(/<(SPAN|IMG|img|A|a|BR|P|p|DIV|H1|H­ 2){1}.*>/i,''), //to do - regular expression for hash symbols to be included
              articleBody:  $('<div>' + dataPoolFilter[i].Related[0].Document.description + '</div>').text(),
              url: dataPoolFilter[i].Related[0].Document.url
            };
            if (accordionValues.articleBody == ""){
              console.log(accordionValues.article);
            }
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

    function callCircleNews(map, circle, radiusM, centerLat, centerLng){
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
      config.toggleAppOpacity();
      noDataAlertIsActive = true
      $("#drawModeClear").css("display", "none");
      deletePolygon();
      deleteAllCircles();
      deleteNews();
    }


    function flip(){
      require(["scripts/assets/jquery.flip.js"],function(){
      
          $("#settings").bind("click",function(){
            $("#configuration").fadeIn("slow");
            // $("#flipbox").flip({
            //     direction:'tb',
            //     content: fillConfig,
            //     onEnd: function(){
            //       $("#flipBack").bind("click",function(){
            //           console.log("test");
            //           $("#flipbox").revertFlip();
            //         });//bind
                 
            //     }//on end
            //   }); //flip
            });//bind

          //$("#test").css("background-color","#ffffff");
            //        console.log('when the animation has already ended');
                    
         
      
      });//require
    }//flip

    //called only once!
    function visualizationAgent(eventName){

      $('#linksContainer [id^="category"]').bind("click", function(){
        state = $("#linksContainer a").index(this);
        console.log(state);});

      $("#advancedSearch").bind('click', config.loadPopupBox);

      $("#popupBoxClose").bind('click', function(){ 
        $('#popup_box').fadeOut("slow");
        config.toggleAppOpacity();
      });

      $("#noDataMessage button").on("click",function(){
        config.toggleAppOpacity();
        $("#noDataMessage").fadeOut("slow");
      });
    } //end visualizationAgent

    return {
        visualizationAgent: visualizationAgent,
        semanticWireAgent: semanticWireAgent
    }

});