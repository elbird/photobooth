/* global document, jQuery, Aviary */
(function (document, $, Aviary) {
    'use strict';
    var $gallery;

    function gallery() {
        return $gallery.data('gallery');
    }
	function postToServer (imageUrl, oldUrl) {
		var data = {
            url: imageUrl,
            oldUrl: oldUrl
        };
		return $.ajax({
			type: 'POST',
			url: 'lib/saveImage.php',
			data: data,
			dataType: 'json'
		}).then(function (data) {
			return data.url;
		});
	}

    var featherEditor = new Aviary.Feather({
        apiKey: '8b3b6b313be62991',
        apiVersion: 3,
        language: 'de',
        enableCORS: true,
        tools: ['text', 'crop', 'resize', 'frames', 'effects', 'stickers', 'colorsplash'],
        appendTo: 'injection_site',
        onReady: function() {
            gallery().close();
        },
        onSave: function(imageID, newURL) {
            var oldUrl = $('#' + imageID).attr('src');
        	postToServer(newURL, oldUrl).then(function (urlOnServer) {
        		var img = document.getElementById(imageID);
            	img.src = urlOnServer;
        	});
            featherEditor.close();

        }
    });

    function registerEventHandler () {
        $(document).on('click', '.edit', function(e) {
            e.preventDefault();
            var imageID = 'id-slide-' + gallery().getIndex();
            featherEditor.launch({
                image: imageID
            });
        });
        $(document).on('slidecomplete', function (e, index, slide) {
            $(slide).find('img').attr('id', 'id-slide-' + index);
        });
        // click on the image to show controls immeadiatly
        $(document).on('opened', function () {

            var controlsClass = gallery().options.controlsClass;

            if (!gallery().container.hasClass(controlsClass)) {
                gallery().container.addClass(controlsClass);
            } 
        });
    }
    // wait for document ready
    $(function () {

        registerEventHandler();

        $gallery = $('#blueimp-gallery');
        $gallery.data({
            useBootstrapModal: false
        });

    });

}(document, jQuery, Aviary));