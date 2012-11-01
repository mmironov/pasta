define(["jQuery", "Handlebars", "style", "googleMaps", "semanticwire", "text!templates/content.html", "text!templates/configurationPage.html"], 
    function($, Handlebars, style, googleMaps, semanticwire, template, configurationPage) {

    // here we compile the templates we will use, so that later we just need to fill them with dynamic values
    var fillTemplate = Handlebars.compile(template); 
    var fillConfig = Handlebars.compile(configurationPage);

    function render(eventName) {
        // create the whole page and put it into the DOM
        $("body").html(fillTemplate);
        $("header").append(fillConfig);
        
        style.setStyle();        
        semanticwire.semanticWireAgent();
        semanticwire.visualizationAgent();    

    } //end of function render

    return {
        render: render
    }
});