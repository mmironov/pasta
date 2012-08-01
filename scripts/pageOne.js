define(["jQuery", "Handlebars", "style", "googleMaps", "semanticwire", "text!templates/pageOne.html", "text!templates/subPage.html", "text!templates/accordionPage.html"], 
    function($, Handlebars, style, googleMaps, semanticwire, template, subPageTemplate, accordionPageTemplate) {

    // here we compile the two templates we will use, so that later we just need to fill them with dynamic values
    var fillTemplate = Handlebars.compile(template);
    var fillSubPageTemplate = Handlebars.compile(subPageTemplate);
    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);

   

    function render(eventName) {
        // create the whole page and put it into the DOM


        var phpRestURL = 'http://localhost/pasta/scripts/backend/'; 
        var i;

        var values = {
            fillMe: "value",
            imgSrc: "./resources/logo.png"
        };

        $("body").html(fillTemplate(values));

        var categories = ["All","Technology","Education","Business","Sport","Health","Entertainment"];    
        var advancedSearch = ["Time filter", "Keyword", "People", "Place"];    

        // fill the list of links and put each of them into the DOM
        var linkValues = {
           linkUrl: "#"
        };

        // linksContainer is saved in a local variable because each jquery call is very costly in terms of performance
        var linksContainer = $("#linksContainer");
        for(i = 0; i < categories.length; i++) {
            linkValues.linkID = "category" + (i + 1);
            linkValues.urlName = categories[i];
            linksContainer.append(fillSubPageTemplate(linkValues));
        }

        var advancedSearchDiv = $("#advancedSearch");
        for (i = 0; i < advancedSearch.length; i++){
            linkValues.linkID = "advancedSearch" + (i + 1);
            linkValues.urlName = advancedSearch[i];
            advancedSearchDiv.append(fillSubPageTemplate(linkValues));
        }

        

        style.setStyle();
        semanticwire.getClickPoint();
        semanticwire.semanticWireAgent();
        
        //accordion effect
        $("#logo").click(function(){
        $(".panel").toggle("fast");
       // $(this).toggleClass("active");
        return false;
        });


       

    } //end of function render

   

    return {
        render: render
    }
});