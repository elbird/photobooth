/* global document, window, jQuery, Aviary */
(function (document, window, $, Aviary) {
    'use strict';
    var $gallery,
        getImagesRequest,
        baseUrl,
        urlType;

    function createNewLink(url) {
        var $link = $('<a data-gallery></a>'),
            $img = $('<img class="thumb"></img>');
        $link.attr('href', url);
        $img.attr('src', baseUrl + '/lib/getThumbnail.php?image=' + encodeURIComponent(url));
        $link.append($img);
        return $link;
    }

    function updateLinks() {
        if(getImagesRequest && (getImagesRequest.state() === 'pending')) {
            return;
        }
        getImagesRequest = $.ajax({
            type: 'GET',
            url: baseUrl + '/lib/listImages.php',
            data: {
                type: urlType
            },
            dataType: 'json'
        });
        getImagesRequest.then(function (data) {
            var i,
                $linksContainer = $('#links'),
                $currentLinks = $linksContainer.find('a'),
                currentLinksArray = [];
            if(data.error || !Array.isArray(data.imageurls)) {
                return false;
            }
            $currentLinks.each(function () {
                var $this = $(this),
                    url = $this.attr('href');

                if(data.imageurls.indexOf(url) === -1){
                    $this.remove();
                } else {
                    currentLinksArray.push(url);
                }
            });

            for (i = data.imageurls.length - 1; i >= 0; i--) {
                if(currentLinksArray.indexOf(data.imageurls[i]) === -1) {
                    // add new node;
                    $linksContainer.prepend(createNewLink(data.imageurls[i]));
                }
            }
        });
 
    }

    function gallery() {
        return $gallery.data('gallery');
    }
	function postToServer (action, currentUrl, newUrl) {
		var data = {
            action: action,
            newImageUrl: newUrl,
            imageUrl: currentUrl
        };
		return $.ajax({
			type: 'POST',
			url: baseUrl + '/lib/saveImage.php',
			data: data,
			dataType: 'json'
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
            var currentUrl = $('a[data-aviary-id-slide=' + imageID + ']').attr('href');
        	postToServer('save', currentUrl, newURL).then(function () {
        		document.location = baseUrl + '/gallery';
        	});
            featherEditor.close();

        }
    });

    function getCurrentImageId () {
        return 'id-slide-' + gallery().getIndex();
    }
    function getCurrentImageUrl() {
        return $(gallery().list[gallery().getIndex()]).attr('href');
    }
    function registerEventHandler () {
        $(document).on('click', '.edit', function(e) {
            e.preventDefault();
            var imageID = getCurrentImageId();
            $(gallery().list[gallery().getIndex()]).attr('data-aviary-id-slide', imageID);
            featherEditor.launch({
                image: imageID
            });
        });
        $(document).on('click', '.save', function(e) {
            e.preventDefault();
            var imageUrl = getCurrentImageUrl();
            postToServer('save', imageUrl, document.location.origin + imageUrl).then(function () {
                document.location = baseUrl + '/gallery';
            });
        });
        $(document).on('click', '.delete', function(e) {
            e.preventDefault();
            var imageUrl = getCurrentImageUrl();
            postToServer('delete', imageUrl).then(function () {
                updateLinks();
                gallery().close();
            });
        });
        $(document).on('click', '.restore', function(e) {
            e.preventDefault();
            var imageUrl = getCurrentImageUrl();
            postToServer('restore', imageUrl).then(function () {
                document.location = baseUrl + '/new';
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
        urlType = $('body').data('urlType');
        baseUrl = $('body').data('baseUrl');
        updateLinks();
        window.setInterval(updateLinks, 10000);

        registerEventHandler();

        $gallery = $('#blueimp-gallery');
        $gallery.data({
            useBootstrapModal: false
        });

    });

}(document, window, jQuery, Aviary));