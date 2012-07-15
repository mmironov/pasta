
require.config({
    paths: {
        jQuery: '../libs/jquery/jquery-loader',
        order: '../libs/require/order-1.0.5',
        text: '../libs/require/text-1.0.6',
        async: '../libs/require/async',
        Handlebars: '../libs/handlebars/Handlebars',
        templates: '../templates',
        resources: '../resources'
    }
});

// We launch the App
require(['jQuery', 'pageOne'], function($, pageOne) {
    
    run();

    function run() {
        console.log("started!");
        pageOne.render();
    }
});