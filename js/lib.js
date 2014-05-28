/* global document, window, jQuery, Aviary */
(function (document, window, $, Aviary) {
    'use strict';
    var $gallery,
        myGallery,
        getImagesRequest,
        baseUrl,
        urlType,
        slideshow = false;

    function createNewLink(url) {
        var $link = $('<a data-gallery></a>'),
            $img = $('<img class="thumb"></img>');
        $link.attr('href', url);
        if(slideshow) {
            //$link.text('test');
            return $link;
        }
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
        return getImagesRequest.then(function (data) {
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
            return $linksContainer;
        });
 
    }

    function gallery() {
        if(myGallery) {
            return myGallery;
        }
        return  $gallery.data('gallery');
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

    function startSlideShow() {
        $('#links').find('a').first().click();
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
        $(document).on('click', '.startSlideShow', function(e) {
           e.preventDefault();
           startSlideShow();
        });
        $(document).on('slidecomplete', function (e, index, slide, gallery) {
            console.log(arguments);
            $(slide).find('img').attr('id', 'id-slide-' + index);
        });
        
        $('#blueimp-gallery').on('opened', function (e, gallery) {
                myGallery = gallery;
        });
        if(!slideshow) {
            // click on the image to show controls immeadiatly
            $(document).on('opened', function (e, gallery) {
                var controlsClass = gallery.options.controlsClass;

                if (!gallery.container.hasClass(controlsClass)) {
                    gallery.container.addClass(controlsClass);
                } 
            });
        }
        if(slideshow){
            $(document).on('slideend', function (e, index, slide, gallery) {
                if (gallery && gallery.slides && gallery.slides.length === index + 1) {
                    window.setTimeout(function () {
                        $(document).one('closed', function () {
                            startSlideShow();
                        });
                        gallery.close();
                    }, 3500);
                }
            });
        }
    }
    // wait for document ready

    window.photobooth = {
        init: function (show) {
            var linksLoadedPromise,
                galleryConfig  = {
                useBootstrapModal: false
            };
            if(show) {
                slideshow = true;
            }
            if(slideshow) {
                galleryConfig.startSlideshow = true;
                galleryConfig.transitionSpeed = 2000;
                galleryConfig.closeOnSlideClick = false;
            }
            urlType = $('body').data('urlType');
            baseUrl = $('body').data('baseUrl');
            linksLoadedPromise = updateLinks();
            window.setInterval(updateLinks, 10000);

            registerEventHandler(slideshow);

            $gallery = $('#blueimp-gallery');
            $gallery.data(galleryConfig);
            if(slideshow) {
                linksLoadedPromise.then(function ($linksContainer) {
                    startSlideShow();
                });
            }
        }

    };

}(document, window, jQuery, Aviary));