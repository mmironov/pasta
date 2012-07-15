define(["jQuery", "text!templates/pageOne.html"], function($, pageone) {

    function setStyle(eventName){
        //style stuff    
         var colors = ["#00a9ba", "#0b52a4", "#755fa7", "#ed0477", "#ec1b21", "#f58927", "#00a54f", "#646560"], state;
         var colorsFrom = ["#00d0e8", "#4095f2", "#a496c5", "#fc67b1", "#f26f72", "#f9ad68", "#40ff9b", "#bfc0bc"];
         var colorsTo = ["#0095a6", "#0b52a4", "#755fa7", "#ed0477", "#ec1b21", "#f58927", "#00a54f", "#646560"];
        state = 0;

        $("#linksContainer a").css({"background" : "-webkit-gradient(linear, left top, left bottom, color-stop(0%," + colorsFrom[7] +"), color-stop(99%," + colorsTo[7] + "))"});
        $("#linksContainer a:nth-child(1)").css({"background" : "-webkit-gradient(linear, left top, left bottom, color-stop(0%," + colorsFrom[0] +"), color-stop(99%," + colorsTo[0] + "))"});
        $("#linksContainer a").click(function(){
            state = $("#linksContainer a").index(this);
            //console.log(state);
            //the default - grey color
            $("#linksContainer a").css({"background" : "-webkit-gradient(linear, left top, left bottom, color-stop(0%," + colorsFrom[7] +"), color-stop(99%," + colorsTo[7] + "))"});
            $("#linksContainer a:nth-child(" + (state + 1) + ")").css({"background" : "-webkit-gradient(linear, left top, left bottom, color-stop(0%," + colorsFrom[state] +"), color-stop(99%," + colorsTo[state] + "))"});
        });
    }



    return {
      
        setStyle: setStyle
    }



});