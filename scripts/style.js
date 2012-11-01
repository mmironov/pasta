define(["jQuery", "Handlebars", "text!templates/content.html", "text!templates/subPage.html", "config"], 
    function($, Handlebars, content, subPageTemplate, config) {

        var fillSubPageTemplate = Handlebars.compile(subPageTemplate);
        var menuColors;

        function getMenuColors(eventName){
            return menuColors;
        }

        function setStyle(eventName){

            var categories = ["All","Tech","Education","Business","Sport","Health","Fun", "Filters"]; 
            menuColors =["#9b3324", "#006821", "#ff0069", "#ff7b00", "#ffe61e", "#00aeff", "#5500a4", "#6a5849"]; 
            var i;  

            // fill the list of links and put each of them into the DOM
            var linkValues = {
               linkUrl: "#"
            };

            // linksContainer is saved in a local variable because each jquery call is very costly in terms of performance
            var linksContainer = $("#linksContainer");
            for(i = 0; i < categories.length - 1; i++) {
                linkValues.linkID = "category" + (i + 1);
                linkValues.urlName = categories[i];
                linksContainer.append(fillSubPageTemplate(linkValues));
            }

            linkValues.linkID = "advancedSearch";
            linkValues.urlName = categories[i];
            linksContainer.append(fillSubPageTemplate(linkValues));

            config.config();
            if (window.localStorage.getItem("configValues")){
                configValues = JSON.parse(window.localStorage.getItem("configValues"));
                console.log("style.js " + configValues.newsPanel);
                if (configValues.newsPanel == 'closed'){
                    //$(".panel").toggle('fast');
                    $(".panel").css("display","none");
                    $("#newsArrow").toggleClass("active");
                }
            }

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
               
            //var originalFontSize = 14;
            var sectionWidth = $('#linksContainer a').width();

            $('#linksContainer a span').each(function(){
                var spanWidth = $(this).width();
                if (spanWidth < 0.8*sectionWidth){
                    $(this).css({"letter-spacing": "2px"});
                }
            });

            //accordion effect
            $("#newsArrow").bind("click",function(){
                $(".panel").toggle("fast");
                $(this).toggleClass("active");
                return false;
            });

            canvas = document.getElementById('canvas');
            $("#drawMode").bind("click", function(){ 
                $("#canvas").css("display", "block");
                $("#drawModeClear").css("display","none");
                canvas.width = canvas.width;
            });
        } //end of setStyle()

        return {
            setStyle: setStyle,
            getMenuColors: getMenuColors
        }
});