define(["jQuery", "text!templates/pageOne.html"], function($, pageone) {

    var menuColors =["#9b3324", "#006821", "#ff0069", "#ff7b00", "#ffe61e", "#00aeff", "#5500a4", "#6a5849"]; 

    function getMenuColors(eventName){
        return menuColors;
    }

    function setStyle(eventName){
        //style stuff    
        
        var i;
        // #891ab6 - purple, coral - #ffcf6c
        for (i = 0; i < menuColors.length; i++){
            $("#linksContainer a:nth-child(" + (i + 1) + ")").css({"background" : menuColors[i]});
        }

       var linksContainerA = $("#linksContainer a");
        var maxLenLabel = $("#linksContainer a:nth-child(1)").width();
               for (i = 1; i < menuColors.length; i++){
                    if ($("#linksContainer a:nth-child(" + i + ")").width() > maxLenLabel){
                        maxLenLabel = $("#linksContainer a:nth-child(" + i + ")").width()
                    }
               }

     $('#linksContainer a').css({"width" : maxLenLabel});
       
    //     var originalFontSize = 14;
    var sectionWidth = $('#linksContainer a').width();

        $('#linksContainer a span').each(function(){
               var spanWidth = $(this).width();

               if (spanWidth < 0.8*sectionWidth){
                $(this).css({"letter-spacing": "2px"});
               }

    //         var newFontSize = (sectionWidth/spanWidth) * originalFontSize;
    //         $(this).css({"font-size" : newFontSize, "line-height" : newFontSize/1.4 + "px"});
         });
     }

    return {
        setStyle: setStyle,
        getMenuColors: getMenuColors
    }

});