 define(["jQuery", "Handlebars", "text!templates/pageOne.html", "text!templates/accordionPage.html"], function($, Handlebars, pageone, accordionPageTemplate) {

    var fillAccordionPageTemplate = Handlebars.compile(accordionPageTemplate);

    var apiKey = "/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b";
    var baseUrl = "http://www.semanticwire.com/api/v2.1/", result, filter;
    var callPoint ="filters";
    var extension = ".json";
    var fullUrl = baseUrl + callPoint + apiKey + extension; 

    var timeFilter = {Filter:{start_date:'2 July 2012', end_date:'9 July 2012', conditions :{and:{Topic:[{id:2}]}}}}
    var Data = {};

 function semanticWireAgent(eventName){
    
        $.ajax({
          type:"POST",
          url:fullUrl,
          data: timeFilter,
          async:false,
          //contentType: "text/xml; charset=utf-8",
          success: function(data){Data = data.data;},
          dataType:"json"
        });

         $('#pageOne').append(Data.Filter.id);

    var documents = "documents/";
    var pagination = "/limit:10000/count:1";
    var urlPool = baseUrl + documents + Data.Filter.id + pagination + apiKey + extension;
    // http://www.semanticwire.com/api/v2.1/documents/4fff5277-8e6c-433a-aee7-19dfc0a8007b/limit:10000/count:1/api_key:4fc54b75-06dc-4d64-935e-39eec0a8017b.json

        $.ajax({
          //type:"GET",
          url:urlPool,
          //data: timeFilter,
          async:false,
          //contentType: "text/xml; charset=utf-8",
          success: function(data){ Data = data.data;},
          dataType:"json"
        });

    $('#pageOne').append(Data[0].Document.title);


    // var newsPool = {
    //     items: [
    //         {title: Data[0].Document.title , description: Data[0].Document.description},
    //         {title: Data[1].Document.title, description: Data[1].Document.description}
    //     ]
    // };

    var accordionValues = {
            article: Data[0].Document.title,
            articleBody: Data[0].Document.description
        };

    var bodyAccordion = $("#bodyAccordion");
    var articles = 7; //for example
    for(var i = 0; i < articles; i++){
        accordionValues.accItemId = "acc" + i;
        bodyAccordion.append(fillAccordionPageTemplate(accordionValues));
    }

    

    }

    function parseData(data) {
        console.log(Data.Filter.id);
        $('#pageOne').append(Data.Filter.id);
        //filter = Data.Filter.id;
        //var obj = jQuery.parseJSON(data);
        //alert(obj);
    }

    function parseData2(data){
        $('#pageOne').append(Data.Document.id);
    }

   


    return {
        semanticWireAgent: semanticWireAgent
    }


});