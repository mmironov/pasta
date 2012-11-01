//this module contains configuration settings and advanced search related functionality
define(["jQuery", "text!templates/content.html", "text!templates/configurationPage.html"], 
  function($, content, configurationPage) {

  	var opacity = 1, timeRangeValues = {};
  	var configValues;

  	function config(eventName){
  		$("#configClose").bind('click', function(){ 
   			$('#configuration').fadeOut("slow");
   		});
  	
  		$("#configButton").bind("click", function(){
  			$('#configuration').fadeOut("slow");
   			configValues = {
	          mapType : mapTypeValues[$("#sliderMapType").slider("value") - 1],
	          newsPanel : newsPanelValues[$("#sliderNewsPanel").slider("value") - 1],
	          timeRange : {"from" : timeRangeValues.privateValues[$("#sliderTimeRange").slider("values", 0)-1], "to" :timeRangeValues.privateValues[$("#sliderTimeRange").slider("values", 1)-1]},
	          keyword : $("input[name=keywordDefault]").val(),
	          people : $("input[name=peopleDefault]").val(),
	          place: $("input[name=placeDefault]").val()
	        };
         
        window.localStorage.setItem("configValues", JSON.stringify(configValues)); 
        //dynamically changing the slider in the filter popup
        timeRangeSlider("#slider","#amount");
    	});
  	}

    function unloadPopupBox(eventName) { 
      toggleAppOpacity();
      advSearchValues = {
        keyword : $("input[name=keyword]").val(),
        timeFilterFrom : timeRangeValues.privateValues[$("#slider").slider("values", 0)-1],
        timeFilterTo : timeRangeValues.privateValues[$("#slider").slider("values", 1)-1],
        place : $("input[name=place]").val(),
        people : $("input[name=people]").val()
      };
    	return advSearchValues;
    }

    //fading out the  opacity - just for visualization - it's not blocking the application
    //to do - block functionality
    function toggleAppOpacity(eventName){     
      if (opacity == 1){
        $("#map, #accordion, header, #newsArrow, #settings, #drawMode").css({"opacity": "0.3"});
        opacity = 0.3;
      }
      else
      {
        $("#map, #accordion, header, #newsArrow, #settings, #drawMode").css({"opacity": "1"});         
        opacity = 1;
      }
    }

    function timeRangeSlider(slider, amount){
      var defValueTimeRange;
      timeRangeValues = {publicValues: ["1 month ago", "2 weeks ago", "1 week ago", "yesterday", "now"], privateValues: ["-1 month", "-2 weeks", "-7 days", "-1 day", "now"]};

      if (window.localStorage.getItem("configValues")){
        configValues = JSON.parse(window.localStorage.getItem("configValues"));
        defValueTimeRange = [timeRangeValues.privateValues.indexOf(configValues.timeRange.from) + 1, timeRangeValues.privateValues.indexOf(configValues.timeRange.to) + 1];
      }else{
        defValueTimeRange = [3, 5];
      }

      $(slider).slider({
        range: true,
        min: 1,
        max: 5,
        values: defValueTimeRange,
        slide: function( event, ui ) {
          $( amount ).val( timeRangeValues.publicValues[ui.values[ 0 ] -1] + " - " + timeRangeValues.publicValues[ui.values[ 1 ] -1]);
        }
      });
     
      $(amount).val( timeRangeValues.publicValues[$(slider).slider("values", 0)-1] + 
        " - " + timeRangeValues.publicValues[$(slider).slider( "values", 1 )-1] );
    }

    function setSlider(eventName){
      require([ "scripts/assets/jquery-ui-1.8.23.custom.min.js"], function(){

        //slider in the advanced search
        timeRangeSlider("#slider", "#amount");
        var configValues, defValueMapType, defValueNewsPanel;

        //sliders in the configuration page
        mapTypeValues = ["RoadMap", "Satellite", "Terrain"];
        if (window.localStorage.getItem("configValues")){
          configValues = JSON.parse(window.localStorage.getItem("configValues"));
          defValueMapType = mapTypeValues.indexOf(configValues.mapType) + 1;
        }else{
          defValueMapType = 1;
        }
        $("#sliderMapType").slider({
            min:1,
            max:3,
            step:1,
            value: defValueMapType,
            slide: function(event, ui){
              $("#mapType").val(mapTypeValues[ui.value - 1 ]);
            }
        });
        $("#mapType").val(mapTypeValues[$("#sliderMapType").slider("value") - 1]);

        newsPanelValues = ["opened", "closed"];
        if (window.localStorage.getItem("configValues")){
          configValues = JSON.parse(window.localStorage.getItem("configValues"));
          defValueNewsPanel = newsPanelValues.indexOf(configValues.newsPanel) + 1;
        }else{
          defValueNewsPanel = 1;
        }

        $("#sliderNewsPanel").slider({
            min:1,
            max:2,
            step:1,
            value:defValueNewsPanel,
            slide: function(event, ui){
              $("#newsPanel").val(newsPanelValues[ui.value - 1 ]);
            }
        });

        $("#newsPanel").val(newsPanelValues[$("#sliderNewsPanel").slider("value") - 1]);
        timeRangeSlider("#sliderTimeRange", "#timeRange");
      });
    }

    //To load the Popupbox for advanced search
    function loadPopupBox(eventName) {   
        $('#popup_box').fadeIn("slow");
        toggleAppOpacity();
    }

  	return {
  		config: config,
  		loadPopupBox: loadPopupBox,
  		unloadPopupBox: unloadPopupBox,
  		toggleAppOpacity: toggleAppOpacity,
  		setSlider: setSlider
  	}

  });